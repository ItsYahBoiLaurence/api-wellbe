import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { raw } from 'express';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { DomainStats, NewAnswerModel } from 'src/types/answer';
import { JwtPayload } from 'src/types/jwt-payload';
import { DomainWellbeing, OverallWellbeingScore, Score, WellbeingItem, WellbeingRawScore } from 'src/types/wellbeing';

@Injectable()
export class WellbeingService {
    private logger = new Logger(WellbeingService.name)

    constructor(private readonly helper: HelperService, private readonly prisma: PrismaService) { }

    private compute(rawScore: number, domain: string) {

        const maxScore = {
            character: 28,
            career: 28,
            contentment: 24,
            connectedness: 20
        }

        return Math.floor((rawScore / (maxScore[domain]) * 100))
    }

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
            }) as NewAnswerModel[]

            if (user_answers.length === 0) {
                throw new NotFoundException("No answers found for this employee!")
            }

            const flatMappedAnswers = user_answers.flatMap(answerRecord => answerRecord.answer)

            const domainScores: Score = {
                character: 0,
                career: 0,
                connectedness: 0,
                contentment: 0
            };

            const categoryMap: Record<string, keyof Score> = {
                '1': 'character',
                '2': 'career',
                '3': 'contentment',
                '4': 'connectedness'
            };

            flatMappedAnswers.forEach((answerData) => {
                const [[key, value]] = Object.entries(answerData)
                const category = key.charAt(0)
                const domain = categoryMap[category]
                if (domain) domainScores[domain] += value
            })


            const [maxCharacterScore, maxCareerScore, maxConnectednessScore, maxContentmentScore] = await Promise.all([
                this.prisma.question.count({
                    where: {
                        domain: 'character'
                    }
                }),
                this.prisma.question.count({
                    where: {
                        domain: 'career'
                    }
                }),
                this.prisma.question.count({
                    where: {
                        domain: 'connectedness'
                    }
                }),
                this.prisma.question.count({
                    where: {
                        domain: 'contentment'
                    }
                })
            ])

            const wellbeing_score = {
                character: domainScores.character,
                career: domainScores.career,
                connectedness: domainScores.connectedness,
                contentment: domainScores.contentment,
            }

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
            Logger.log(error, "ERROR LOG IN WELLBEING")
            if (error.code === 'P2002') throw new ConflictException("Wellbeing already generated!")
        }
    }

    async getUserWellbeing(user_details: JwtPayload) {

        const { sub } = user_details

        const user = await this.helper.getUserByEmail(sub)

        const scores = await this.prisma.wellbeing.findFirst({
            where: {
                user_email: user.email
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        const score = (scores as unknown) as {
            user_email: string,
            created_at: string,
            wellbeing_score: { career: number, character: number, contentment: number, connectedness: number },
            department: string,
            batch_id: string,
            id: string
        }

        if (!score) throw new NotFoundException("Score not found!")

        const result: { score: number, scoreband: string, domain: string }[] = []

        const { wellbeing_score } = score

        for (const domain in wellbeing_score) {
            const scoreband = this.getStanine(wellbeing_score[domain], domain)
            result.push({ domain, scoreband, score: this.compute(wellbeing_score[domain], domain) })
        }

        return result
    }

    async getCompanyWellbeing(user_details: JwtPayload, period?: string) {

        const company = await this.helper.getCompany(user_details.company)

        const month = this.helper.getPeriod(period)

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

        const totals = wellbeing.reduce((acc, { wellbeing_score }) => {
            acc.career += wellbeing_score.career
            acc.character += wellbeing_score.character
            acc.contentment += wellbeing_score.contentment
            acc.connectedness += wellbeing_score.connectedness
            return acc
        },
            { career: 0, character: 0, contentment: 0, connectedness: 0 }
        )
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

        const wellbe = Math.floor((career + character + contentment + connectedness))

        return {
            career: this.compute(career, 'career'),
            character: this.compute(character, 'character'),
            contentment: this.compute(contentment, 'contentment'),
            connectedness: this.compute(connectedness, 'connectedness'),
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
                created_at: 'asc'
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

        // const batch = (batch_record as unknown) as WellbeingRawScore[]

        // this.logger.log(batch)

        return batch.map(({ created_at, Wellbeing }) => {
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
            const wellbeing = Math.floor(sumOfAverages);
            const data = { created_at, wellbeing }
            return data
        })
    }

    async getDomainInsight(user_details: JwtPayload, period?: string) {
        const company = await this.helper.getCompany(user_details.company)

        const month = this.helper.getPeriod(period)

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

        const raw_wellbeing = await this.prisma.wellbeing.findMany({
            where: filter,
            select: {
                wellbeing_score: true
            }
        }) as OverallWellbeingScore[]

        if (!raw_wellbeing || raw_wellbeing.length == 0) throw new NotFoundException("No wellbeing data!")

        const postComputedData = raw_wellbeing.reduce((acc, { wellbeing_score }) => {
            acc.character += wellbeing_score.character
            acc.career += wellbeing_score.career
            acc.connectedness += wellbeing_score.connectedness
            acc.contentment += wellbeing_score.contentment
            return acc
        }, { character: 0, career: 0, connectedness: 0, contentment: 0 })

        const result: DomainWellbeing[] = []

        const domainNameMap = {
            character: "CHARACTER",
            career: "CAREER",
            connectedness: "CONNECTEDNESS",
            contentment: "CONTENTMENT"
        }


        for (const domain in postComputedData) {
            const average = Math.floor(postComputedData[domain] / raw_wellbeing.length);
            const score_band = this.getStanine(average, domain) == "High" ? "VERY_HIGH"
                : this.getStanine(average, domain) == "Above Average" ? "ABOVE_AVERAGE"
                    : this.getStanine(average, domain) == "Average" ? "AVERAGE"
                        : this.getStanine(average, domain) == "Below Average" ? "BELOW_AVERAGE"
                            : this.getStanine(average, domain) == "Low" ? "VERY_LOW"
                                : undefined

            const domainName = domainNameMap[domain]

            const domainInsight = await this.prisma.domainInterpretation.findFirst({
                where: {
                    domain: domainName,
                    score_band
                }
            })

            if (!domainInsight) throw new ConflictException("No Insight")

            const data: DomainWellbeing = {
                domain,
                stanine_score: this.compute(average, domain),
                stanine_label: this.getStanine(average, domain),
                insight: domainInsight.insight,
                to_do: domainInsight.what_to_build_on
            };

            result.push(data)
        }
        return result
    }

    private getStanine(value: number, domain: string) {

        switch (domain) {
            case "character":
                return value > 26 ? "Above Average"
                    : value <= 26 && value >= 21 ? "Average"
                        : value == 20 ? "Below Average"
                            : value <= 19 ? "Low"
                                : "Invalid Label"

            case "career":
                return value > 26 ? "Above Average"
                    : value <= 26 && value >= 21 ? "Average"
                        : value == 20 ? "Below Average"
                            : value <= 19 ? "Low"
                                : "Invalid Label"

            case "connectedness":
                return value == 20 ? "High"
                    : value <= 19 && value >= 18 ? "Above Average"
                        : value <= 17 && value >= 13 ? "Average"
                            : value <= 12 && value >= 11 ? "Below Average"
                                : value < 11 ? "Low"
                                    : "Invalid Label"

            case "contentment":
                return value >= 21 ? "High"
                    : value <= 20 && value >= 19 ? "Above Average"
                        : value <= 18 && value >= 13 ? "Average"
                            : value <= 12 && value >= 10 ? "Below Average"
                                : value <= 9 ? "Low"
                                    : "Invalid Label"
            default:
                return "Invalid Domain"
        }
    }
}
