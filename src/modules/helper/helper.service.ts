import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserQuery } from 'src/types/user';
import * as bcrypt from 'bcrypt'
import { JwtPayload } from 'src/types/jwt-payload';
import { AnswerModel } from 'src/types/answer';
import { Exception } from 'handlebars';

@Injectable()
export class HelperService {
    constructor(private readonly prisma: PrismaService,
    ) { }

    async getCompany(company_name: string) {
        if (!company_name) throw new BadRequestException("Invalid Payload")
        const company = await this.prisma.company.findUnique({
            where: {
                name: company_name
            }
        })

        if (!company) throw new NotFoundException("Company doesn't exist")

        return company
    }

    async getUserByEmail(email: string) {
        const user = await this.prisma.employee.findFirst({
            where: {
                email
            }
        })
        if (!user) throw new NotFoundException("User doesn't exist")
        return user
    }

    async getDepartmentId(company_name: string, department_name: string) {
        if (!company_name || !department_name) throw new BadRequestException()

        const department = await this.prisma.department.findUnique({
            where: {
                name_company_id: {
                    name: department_name,
                    company_id: company_name,
                },
            },
        })

        if (!department) throw new NotFoundException("Department doesn't exist")

        return department.id
    }

    async getUserIdByEmail(user_data: JwtPayload) {

        const { sub, company } = user_data

        const userDetails = await this.prisma.employee.findUnique({
            where: {
                email: sub,
                department: {
                    company: {
                        name: company
                    }
                }
            },
            omit: {
                password: true,
                role: true
            },
            include: {
                department: {
                    select: {
                        name: true,
                        company: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
        })

        if (!userDetails) throw new NotFoundException(`User with the email of ${sub} does not exist!`)

        return userDetails
    }

    async generateBatchQuestions() {
        try {
            const questions = await this.prisma.question.findMany({
                select: {
                    id: true,
                    domain: true
                }
            });

            // Categorize questions by domain
            const domainMap: { [key: string]: number[] } = {
                character: [],
                career: [],
                connectedness: [],
                contentment: []
            };

            questions.forEach(({ id, domain }) => {
                if (domainMap[domain]) {
                    domainMap[domain].push(id);
                }
            });

            // Shuffle function
            function shuffleArray<T>(array: T[]): T[] {
                const arr = [...array];
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr;
            }

            // Shuffle each domain
            for (const domain in domainMap) {
                domainMap[domain] = shuffleArray(domainMap[domain]);
            }

            // Initialize 5 empty sets
            const sets: number[][] = Array.from({ length: 5 }, () => []);

            // Assign one question from each domain to each set
            for (let i = 0; i < 5; i++) {
                for (const domain in domainMap) {
                    const question = domainMap[domain].pop();
                    if (question !== undefined) {
                        sets[i].push(question);
                    }
                }
            }

            // Collect remaining questions
            const remainingQuestions = Object.values(domainMap).flat();

            // Distribute remaining questions to complete each set with 5 questions
            let setIndex = 0;
            for (const question of remainingQuestions) {
                if (sets[setIndex].length < 5) {
                    sets[setIndex].push(question);
                    setIndex = (setIndex + 1) % 5;
                }
            }

            return sets;
        } catch (error) {
            Logger.error('Error generating batch questions:', error);
            return {
                message: "There's an error while generating the questions."
            };
        }
    }

    async getBatch(company_name: string) {
        const company_record = await this.prisma.batch_Record.findMany({
            where: {
                company_name
            }
        })
        return company_record
    }

    async isReadyToReleaseNewBatch(company_name: string) {
        const company_record = await this.prisma.batch_Record.findFirst({
            where: {
                company_name
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (!company_record) return true

        if (company_record?.is_completed === false) return false

        return true
    }

    async getCurrentSet(company_name: string) {
        const current_set = await this.prisma.batch_Record.findFirst({
            where: {
                company_name
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (!current_set) throw new NotFoundException('No Batch Available!')

        return current_set?.current_set_number
    }

    async getLatestBatch(company_name: string) {
        const latest_batch = await this.prisma.batch_Record.findFirst({
            where: {
                company_name
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (!latest_batch) throw new NotFoundException("No available batch")

        return latest_batch
    }

    async hashPass(password: string) {
        return await bcrypt.hash(password, 10)
    }

    async comparePass(password: string, hashed_pass: string) {
        return await bcrypt.compare(password, hashed_pass)
    }

    async transformString(text: string) {
        return text.toLowerCase().replace(' ', '-')
    }

    async getCompanyConfig(name: string) {
        const setting = await this.prisma.settings.findFirst({
            where: {
                config_id: name
            }
        })
        if (!setting) throw new NotFoundException(`No setting found for ${name} company`)
        return setting
    }

    async getDepartmentIdByUserEmail(email: string) {
        const employee = await this.prisma.employee.findUnique({
            where: {
                email
            },
        })
        if (!employee) throw new NotFoundException("User not Found")
        return employee.department_id
    }

    async getDepartment(company: string, department: string) {
        const department_details = await this.prisma.department.findFirst({
            where: {
                company_id: company,
                name: department
            }
        })

        if (!department_details) throw new NotFoundException("Department not Found!")

        return department_details
    }

    async userCompletedTheBatch(email: string, batch_id: number) {

        const payload = {
            email_batch_id: {
                email,
                batch_id
            }
        }

        const employee_batch_data = await this.prisma.employee_Under_Batch.findUnique({
            where: payload
        })

        if (!employee_batch_data) throw new NotFoundException("User doens't belong to the batch!")

        if (Array.isArray(employee_batch_data.set_participation)) {
            const completed = [...employee_batch_data.set_participation].includes(false)

            await this.prisma.employee_Under_Batch.update({
                where: payload,
                data: {
                    is_completed: !completed
                }
            })
        }
    }

    async getExistingAdvice(sub_domain: string, score: number) {

        const user_score = score == 4 ? "above_average" : score == 3 ? "average" : score == 2 ? "below_average" : score == 1 ? "low" : ""
        Logger.log("----------------")
        Logger.log(sub_domain)
        Logger.log("----------------")

        const advice = await this.prisma.advice.findFirst({
            where: {
                sub_domain
            },
        })

        if (!advice) throw new NotFoundException("Advice not Found!")

        return advice[user_score]
    }


    async getAdviceForUser(data: AnswerModel[]) {

        const advices: string[] = []

        for (const obj of data) {
            const [key, value] = Object.entries(obj)[0]
            const question = await this.prisma.question.findUnique({
                where: {
                    id: Number(key)
                }
            })
            if (!question) throw new NotFoundException("Question not Found!")

            const advice = await this.getExistingAdvice(question.subdomain, value)
            advices.push(advice)
        }
        return advices.join(" ")
    }

    getCurrentDate() {
        const date = new Date
        date.setHours(date.getHours() + 8)
        return date
    }


    async getBatchTips(batch_id: number, user: string) {

        const tips_bank: string[] = []

        const tips = await this.prisma.tips.findMany({
            where: {
                user,
                batch_created: batch_id
            },
            select: {
                tip: true
            }
        })

        if (!tips) throw new NotFoundException("Tips not Found!")

        for (const obj of tips) {
            const [key, value] = Object.entries(obj)[0]
            tips_bank.push(value)
        }

        return tips_bank.join(" ")
    }

    async getNotFinished() {
        const companies = await this.prisma.batch_Record.findMany({
            where: {
                is_completed: false
            },
            select: {
                company_name: true,
                employees_under_batch: {
                    select: {
                        email: true
                    }
                },
                frequency: true
            }
        })

        if (!companies) throw new Exception("No Companies")

        Logger.log(companies)

        const company_data = companies.map(({ company_name, employees_under_batch, frequency }) => ({
            company: company_name,
            frequency,
            emails: employees_under_batch.map(emp => emp.email),
        }))

        return company_data
    }

    getPeriod(period?: string) {
        if (!period) return undefined
        const data_period = period == "quarter" ? 3 : period == "semiannual" ? 6 : period == "annual" ? 12 : 0
        const date = new Date()
        const XMonthsAgo = new Date(date)
        XMonthsAgo.setMonth(XMonthsAgo.getMonth() - data_period)
        return XMonthsAgo
    }
}



