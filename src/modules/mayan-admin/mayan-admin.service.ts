import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyData, CompanyModel } from 'src/types/company';
import { UserService } from '../user/user.service';
import { HelperService } from '../helper/helper.service';
import { JwtPayload } from 'src/types/jwt-payload';
import { User } from 'src/types/user';
import { ConfigService } from '@nestjs/config';
import { EmailerService } from '../emailer/emailer.service';
import { AnswerLabel, Tally } from 'src/types/question-tally';
import { RawAnswer } from 'src/types/answer';
import { Question, RawAnswerItem, ResultItem } from 'src/types/mayan-admin';

@Injectable()
export class MayanAdminService {

    private logger = new Logger(MayanAdminService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly helper: HelperService,
        private readonly config: ConfigService,
        private readonly mail: EmailerService
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
        const { company } = user_data

        // 1. Fetch the latest completed batch record
        const latestBatch = await this.prisma.batch_Record.findFirst({
            where: { is_completed: true, company_name: company },
            select: { id: true, created_at: true },
            orderBy: { created_at: 'desc' } // Assuming 'asc' means oldest completed, if you mean latest, use 'desc'
        });

        if (!latestBatch) {
            throw new NotFoundException("No completed batch found.");
        }

        // 2. Fetch all raw answers for the batch
        const rawAnswers = await this.prisma.answer.findMany({
            where: {
                employee: {
                    batch_id: latestBatch.id
                }
            },
            select: {
                answer: true
            }
        }) as RawAnswerItem[]; // Type assertion after fetching

        if (rawAnswers.length === 0) {
            throw new NotFoundException("No answers found for the completed batch.");
        }

        // 3. Flatten and transform answers
        // Assuming rawAnswers[x].answer is already an array of single-key objects, e.g., [{ "1": 4 }, { "2": 3 }]
        const flattenedAnswers = rawAnswers.flatMap(item => item.answer);

        const valueToLabel: Record<number, AnswerLabel> = {
            4: "SA",
            3: "A",
            2: "D",
            1: "SD",
        };

        // 4. Tally the answers
        const tallyMap: Record<string, Tally> = {};
        const questionIdsToFetch = new Set<number>(); // Collect QIDs for batch fetching

        flattenedAnswers.forEach((entry) => {
            // Assuming entry is like { "questionId": value }
            const questionId = Object.keys(entry)[0];
            const value = entry[questionId];

            if (value === undefined || valueToLabel[value] === undefined) {
                console.warn(`Skipping invalid answer value for question ${questionId}: ${value}`);
                return; // Or throw an error, depending on desired strictness
            }

            const label = valueToLabel[value];
            tallyMap[questionId] ??= { SA: 0, A: 0, D: 0, SD: 0 };
            tallyMap[questionId][label]++;
            questionIdsToFetch.add(parseInt(questionId));
        });

        // 5. Fetch all questions in a single query
        const questions = await this.prisma.question.findMany({
            where: {
                id: {
                    in: Array.from(questionIdsToFetch)
                }
            },
            omit: {
                subdomain: true,
                is_flipped: true
            }
        });

        const questionMap = new Map<number, Question>();
        questions.forEach(q => questionMap.set(q.id, q));

        // 6. Format the final result
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
                question: question,
                respondents: respondents,
                answer: answers,
            });
        }

        return {
            results: result,
            date: latestBatch.created_at,
        }
    }
}
