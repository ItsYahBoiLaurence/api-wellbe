import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyData, CompanyModel } from 'src/types/company';
import { UserService } from '../user/user.service';
import { HelperService } from '../helper/helper.service';
import { JwtPayload } from 'src/types/jwt-payload';
import { ConfigService } from '@nestjs/config';
import { EmailerService } from '../emailer/emailer.service';
import { AnswerLabel, Tally } from 'src/types/question-tally';
import { CompanyAnswerModel, NewAnswerModel } from 'src/types/answer';
import { Question, RawAnswerItem, ResultItem } from 'src/types/mayan-admin';
import { AuthService } from '../auth/auth.service';
import { Score } from 'src/types/wellbeing';

@Injectable()
export class MayanAdminService {

    private logger = new Logger(MayanAdminService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly helper: HelperService,
        private readonly config: ConfigService,
        private readonly mail: EmailerService,
        private readonly auth: AuthService
    ) { }

    async getCompanyDetails(user_details: JwtPayload): Promise<CompanyData[]> {
        const companies = await this.prisma.company.findMany({
            include: {
                departments: {
                    include: {
                        _count: {
                            select: { employees: true },
                        },
                    },
                },
            },
        });

        return companies.map((company) => {
            const totalEmployees = company.departments.reduce(
                (sum, dept) => sum + dept._count.employees,
                0
            );

            return {
                id: company.id,
                name: company.name,
                date_created: company.created_at,
                employee_count: totalEmployees,
            };
        });
    }

    async getAllAdminUser() {

        const adminUsers = await this.prisma.employee.findMany({
            where: {
                role: "admin"
            },
            include: {
                department: {
                    select: {
                        company_id: true
                    }
                }
            },
            omit: {
                password: true,
                role: true,
                department_id: true
            },
        })

        if (!adminUsers) return []

        return adminUsers
    }

    async getCompanies() {
        const company_details = await this.prisma.company.findMany({
            select: {
                name: true,
                departments: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!company_details) return new ConflictException("No Company Details")

        return company_details
    }

    async createCompany(data: CompanyModel) {
        try {
            const newCompany = await this.prisma.company.create({
                data: {
                    name: data.company,
                    departments: {
                        create: {
                            name: "Human Resources"
                        }
                    },
                    Settings: {
                        create: {}
                    }
                },
            })
            if (!newCompany) throw new ConflictException("Error Creating new Company")
            return newCompany
        } catch (error) {
            if (error.code === 'P2002') throw new ConflictException("Company Already Exist")
        }
    }

    async getAllDepartments(company: string) {
        const departments = await this.prisma.department.findMany({
            where: {
                company_id: company
            },
            select: {
                name: true
            }
        })
        if (!departments) return []

        return departments.map((department) => department.name)
    }

    async deleteCompany(id: string) {
        if (!id) throw new ConflictException("Company ID is required")
        try {
            await this.prisma.company.delete({
                where: {
                    id
                }
            })
            return { message: "Company Deleted Successfully!" }
        } catch (error) {
            this.logger.log(error)
        }
    }

    async inviteAdminUser(data: {
        email: string
        first_name: string
        last_name: string
        department: string
        company: string
    }) {
        const domain_link = this.config.get<string>("INVITE_LINK")
        Logger.log(data)
        try {
            const link = `${domain_link}/sign-up?email=${data.email}&firstname=${data.first_name}&lastname=${data.last_name}&department=${data.department}&company=${data.company}&role=admin`
            this.mail.inviteEmployee(data.first_name, data.email, data.company, link)
            return { message: "Invite Sent" }
        } catch (e) {
            throw new e
        }
    }


    async generateData(user_data: JwtPayload) {
        const { company } = user_data;

        // 1. Fetch latest completed batch
        const latestBatch = await this.prisma.batch_Record.findFirst({
            where: { is_completed: true, company_name: company },
            select: { id: true, created_at: true },
            orderBy: { created_at: 'desc' }
        });

        if (!latestBatch) {
            throw new NotFoundException("No completed batch found.");
        }

        // 2. Fetch raw answers
        const rawAnswers = await this.prisma.answer.findMany({
            where: {
                employee: {
                    batch_id: latestBatch.id
                }
            },
            select: {
                answer: true
            }
        }) as RawAnswerItem[];

        if (rawAnswers.length === 0) {
            throw new NotFoundException("No answers found for the completed batch.");
        }

        // 3. Flatten answers
        const flattenedAnswers = rawAnswers.flatMap(item => item.answer);

        const valueToLabel: Record<number, AnswerLabel> = {
            4: "SA",
            3: "A",
            2: "D",
            1: "SD",
        };

        const tallyMap: Record<string, Tally> = {};
        const questionIdsToFetch = new Set<number>();

        flattenedAnswers.forEach((entry) => {
            const questionId = Object.keys(entry)[0];
            const value = entry[questionId];

            if (value === undefined || valueToLabel[value] === undefined) {
                console.warn(`Skipping invalid answer value for question ${questionId}: ${value}`);
                return;
            }

            const label = valueToLabel[value];
            tallyMap[questionId] ??= { SA: 0, A: 0, D: 0, SD: 0 };
            tallyMap[questionId][label]++;
            questionIdsToFetch.add(parseInt(questionId));
        });

        const questionIds = Array.from(questionIdsToFetch);

        // 4. Generate level per question
        const questionLevels = new Map<number, "LOW" | "BELOW_AVERAGE" | "AVERAGE" | "HIGH">();

        for (const id in tallyMap) {
            const qid = parseInt(id);
            const answers = tallyMap[id];

            const agree = answers["SA"] + answers["A"];
            const total = agree + answers["D"] + answers["SD"];
            const percentage = (agree / total) * 100;

            let label: "LOW" | "BELOW_AVERAGE" | "AVERAGE" | "HIGH";

            if (percentage <= 25) label = "LOW";
            else if (percentage <= 50) label = "BELOW_AVERAGE";
            else if (percentage <= 75) label = "AVERAGE";
            else label = "HIGH";

            questionLevels.set(qid, label);
        }

        // 5. Fetch questions and all interpretations
        const questions = await this.prisma.question.findMany({
            where: {
                id: {
                    in: questionIds
                }
            },
            select: {
                id: true,
                question: true,
                domain: true,
                interpretation: true // fetch all and filter in JS
            }
        });

        // 6. Filter interpretations based on per-question level
        const questionMap = new Map<number, Question>();
        questions.forEach(q => {
            const level = questionLevels.get(q.id);
            q.interpretation = q.interpretation?.filter(i => i.score_band === level);
            questionMap.set(q.id, q);
        });

        // 7. Format final results
        const result: ResultItem[] = [];
        for (const qidString in tallyMap) {
            const qid = parseInt(qidString);
            const answers = tallyMap[qidString];
            const question = questionMap.get(qid);

            if (!question) {
                console.warn(`Question with ID ${qid} not found in database. Skipping.`);
                continue;
            }

            const respondents = Object.values(answers).reduce((sum, count) => sum + count, 0);

            result.push({
                question,
                respondents,
                answer: answers,
            });
        }

        return {
            results: result,
            date: latestBatch.created_at,
        };
    }

    async loginSuperAdmin(payload: { email: string, password: string }) {
        if (!payload || !payload.email || !payload.password) {
            throw new BadRequestException("Invalid Payload");
        }

        const adminUser = await this.prisma.employee.findUnique({
            where: {
                email: payload.email,
                role: "superadmin"
            },
            include: {
                department: {
                    select: {
                        company: true
                    }
                }
            }
        })
        if (!adminUser) throw new NotFoundException('User not found!')

        const data = {
            email: adminUser.email,
            company: adminUser.department.company.name,
            role: adminUser.role
        }

        return this.auth.signCreds(data)
    }

    async generateHashPass(data: { password: string }) {
        return this.helper.hashPass(data.password)
    }

    async generateSingleWellbeing() {
        const email = "cristina.libuton@yellowcabpizza.com"

        const eub = await this.prisma.employee_Under_Batch.findFirst({
            where: { email },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (!eub) {
            throw new NotFoundException("Employee Under Batch not found!")
        }

        console.log(eub)

        const answers = await this.prisma.answer.findMany({
            where: {
                employee_id: eub.id
            }
        }) as NewAnswerModel[]

        if (answers.length === 0) {
            throw new NotFoundException("No answers found for this employee!")
        }

        const flatMappedAnswers = answers.flatMap(answerRecord => answerRecord.answer)

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

        return domainScores
    }

    async generateCompanyWellbeing() {

        const latestBatch = await this.prisma.batch_Record.findFirst({
            where: {
                company_name: "Yellow Cab"
            },
            orderBy: {
                created_at: 'desc'
            },
            select: {
                id: true
            }
        });

        if (!latestBatch) throw new NotFoundException("No Batch Available!")

        const [raw_answers, finishedEubCount] = await Promise.all([
            await this.prisma.answer.findMany({
                where: {
                    employee: {
                        batch_id: latestBatch.id,
                        is_completed: true
                    }
                },
                select: {
                    answer: true,
                    employee_id: true
                }
            }) as CompanyAnswerModel[],
            this.prisma.employee_Under_Batch.count({
                where: {
                    batch_id: latestBatch.id,
                    is_completed: true
                }
            })

        ])

        if (raw_answers.length === 0) throw new ConflictException("No answer data!")
        if (finishedEubCount === 0) throw new ConflictException("No user completed the batch!")


        const totalWellbeing = {
            character: 0,
            career: 0,
            connectedness: 0,
            contentment: 0
        }

        const categoryMap: Record<string, keyof Score> = {
            '1': 'character',
            '2': 'career',
            '3': 'contentment',
            '4': 'connectedness'
        };

        for (const { answer } of raw_answers) {
            for (const singleAns of answer) {
                const [[key, value]] = Object.entries(singleAns)
                const category = key.charAt(0)
                const domain = categoryMap[category]
                if (domain) totalWellbeing[domain] += value
            }
        }

        const averageDomainScore = {
            character: Math.floor(totalWellbeing.character / finishedEubCount),
            career: Math.floor(totalWellbeing.career / finishedEubCount),
            connectedness: Math.floor(totalWellbeing.connectedness / finishedEubCount),
            contentment: Math.floor(totalWellbeing.contentment / finishedEubCount)
        }

        return averageDomainScore
    }
}
