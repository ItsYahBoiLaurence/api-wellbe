import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { DomainStats } from 'src/types/answer';
import { JwtPayload } from 'src/types/jwt-payload';
import { Score, WellbeingItem } from 'src/types/wellbeing';

@Injectable()
export class WellbeingService {
    constructor(private readonly helper: HelperService, private readonly prisma: PrismaService) { }

    async generateUserWellbeing(user: JwtPayload) {

        try {
            const start = new Date()
            start.setHours(start.getHours() + 8)

            const { company, sub } = user

            const latest_batch = await this.helper.getLatestBatch(company)

            const employee_data = await this.prisma.employee.findUnique({
                where: {
                    email: sub
                }
            })


            const user_batch_data = await this.prisma.employee_Under_Batch.findFirst({
                where: {
                    email: sub,
                    batch_id: latest_batch.id
                },
            })

            if (!employee_data) throw new NotFoundException("User not Found!")
            if (!user_batch_data) throw new NotFoundException("No Batch Available!")
            if (user_batch_data.is_completed === false) throw new ConflictException("Incomplete user data. Cannot generate Report!")

            const user_answers = await this.prisma.answer.findMany({
                where: {
                    employee_id: user_batch_data.id
                }, select: {
                    answer: true
                }
            })

            if (!user_answers) throw new NotFoundException("User has no Answer!")

            const wellbeing_score = this.compute_wellbeing(user_answers);

            const wellbeing = await this.prisma.wellbeing.create({
                data: {
                    user_email: user_batch_data.email,
                    created_at: start,
                    wellbeing_score,
                    batch_id: latest_batch.id,
                    department: employee_data.department_id
                }
            })

            if (!wellbeing) throw new ConflictException("Error saving score!")

            return { message: "Successful wellbeing score generation!" }
        } catch (error) {
            if (error.code === 'P2002') throw new ConflictException("Wellbeing already generated!")
        }
    }

    async getUserWellbeing(user_details: JwtPayload) {

        const { sub } = user_details

        const user = await this.helper.getUserByEmail(sub)

        const score = await this.prisma.wellbeing.findFirst({
            where: {
                user_email: user.email
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (!score) throw new NotFoundException("Score not found!")

        return score.wellbeing_score
    }

    private compute_wellbeing(user_answers: { answer: JsonValue }[]) {
        const domains: Record<string, DomainStats> = {
            character: { sum: 0, count: 0 },
            career: { sum: 0, count: 0 },
            connectedness: { sum: 0, count: 0 },
            contentment: { sum: 0, count: 0 },
        };

        user_answers.forEach(({ answer }) => {
            // Inline loop over each answer array—still overall O(N)
            for (const qa of answer as Record<string, number>[]) {
                const key = Object.keys(qa)[0];
                const val = qa[key];
                const id = +key;

                // Determine domain in one conditional tree
                let bucket: DomainStats;
                if (id < 200) bucket = domains.character;
                else if (id < 300) bucket = domains.career;
                else if (id < 400) bucket = domains.connectedness;
                else bucket = domains.contentment;

                bucket.sum += val;
                bucket.count += 1;
            }
        });

        // Compute percentage scores (truncated) in one go
        const result = Object.fromEntries(
            Object.entries(domains).map(([domain, { sum, count }]) => {
                const pct = count > 0 ? Math.floor((sum / (count * 4)) * 100) : 0;
                return [domain, pct];
            })
        ) as Record<string, number>;

        return result
    }

    async getCompanyWellbeing(user_details: JwtPayload, period?: string) {

        const company = await this.helper.getCompany(user_details.company)

        const month = this.helper.getPeriod(period)

        Logger.log(month, "asds")

        const filter = {
            user: {
                department: {
                    company: {
                        name: company.name
                    }
                }
            },
            created_at: {
                gte: month
            }
        }

        const [employee_count, raw_wellbeing] = await Promise.all([
            this.prisma.wellbeing.count({ where: filter }),
            this.prisma.wellbeing.findMany({
                where: filter,
                select: {
                    wellbeing_score: true
                }
            })
        ])

        if (!employee_count && !raw_wellbeing) throw new NotFoundException("No wellbeing data!")

        const wellbeing: WellbeingItem[] = raw_wellbeing.map((item) => {
            return {
                wellbeing_score: (item.wellbeing_score as unknown) as Score
            }
        })

        const totals = wellbeing.reduce(
            (acc, { wellbeing_score }) => {
                acc.career += wellbeing_score.career
                acc.character += wellbeing_score.character
                acc.contentment += wellbeing_score.contentment
                acc.connectedness += wellbeing_score.connectedness
                return acc
            },
            { career: 0, character: 0, contentment: 0, connectedness: 0 }
        )
        Logger.log(raw_wellbeing, "asddd")
        return this.getAverage(totals, employee_count)
    }

    async getDepartmentWellbeing(user_details: JwtPayload, period?: string) {
        const company = await this.helper.getCompany(user_details.company)

        const month = this.helper.getPeriod(period)

        const deptWellbeing = await this.prisma.department.findMany({
            where: {
                company_id: company.name
            },
            select: {
                name: true,
                Wellbeing: {
                    where: {
                        created_at: {
                            gte: month
                        }
                    },
                    select: {
                        wellbeing_score: true
                    }
                }
            }
        });

        return deptWellbeing.map(({ name, Wellbeing }) => {
            if (Wellbeing.length === 0) {
                return { name, average_Wellbeing: null, wellbeing: null };
            }

            const scores = Wellbeing.map(w =>
                w.wellbeing_score as Record<string, number>
            );

            const keys = Object.keys(scores[0]);

            const average_Wellbeing = keys.reduce((acc, key) => {
                const total = scores.reduce((sum, s) => sum + (s[key] ?? 0), 0);
                acc[key] = Math.floor(total / scores.length);
                return (acc);
            }, {} as Record<string, number>);

            const sumOfAverages = keys.reduce(
                (sum, key) => sum + average_Wellbeing[key],
                0
            );
            const wellbeing = Math.floor(sumOfAverages / keys.length);

            return { name, average_Wellbeing, wellbeing };
        });
    }

    private getAverage(data: Score, count: number) {
        const career = Math.floor(data.career / count)
        const character = Math.floor(data.character / count)
        const contentment = Math.floor(data.contentment / count)
        const connectedness = Math.floor(data.connectedness / count)

        const wellbe = Math.floor((career + character + contentment + connectedness) / 4)

        return {
            career,
            character,
            contentment,
            connectedness,
            wellbe
        }
    }

    async getComputedDomain(user_details: JwtPayload, period?: string) {
        const company = await this.helper.getCompany(user_details.company)
        const month = this.helper.getPeriod(period)

        const batch = await this.prisma.batch_Record.findMany({
            where: {
                company_name: company.name,
                created_at: {
                    gte: month
                },
                is_completed: true
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 12,
            select: {
                created_at: true,
                Wellbeing: {
                    select: {
                        wellbeing_score: true
                    }
                }
            }
        })

        const sortedBatch = batch.reverse()

        return sortedBatch.map(({ created_at, Wellbeing }) => {
            if (Wellbeing.length === 0) {
                return { created_at, wellbeing: null }
            }

            const wellbe = Wellbeing.map(w =>
                w.wellbeing_score as Record<string, number>
            )

            const keys = Object.keys(wellbe[0])

            const average_Wellbeing = keys.reduce((acc, key) => {
                const total = wellbe.reduce((sum, s) => sum + (s[key] ?? 0), 0);
                acc[key] = Math.floor(total / wellbe.length);
                return (acc);
            }, {} as Record<string, number>);

            const sumOfAverages = keys.reduce(
                (sum, key) => sum + average_Wellbeing[key],
                0
            );

            const wellbeing = Math.floor(sumOfAverages / keys.length);

            return { created_at, wellbeing }
        })
    }
} 
