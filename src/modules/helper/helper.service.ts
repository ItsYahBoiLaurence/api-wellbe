import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserQuery } from 'src/types/user';

@Injectable()
export class HelperService {
    constructor(private readonly prisma: PrismaService) { }

    async getCompany(company_name: string) {
        const company = await this.prisma.company.findUnique({
            where: {
                name: company_name
            }
        })

        if (!company) throw new NotFoundException("Company doesn't exist")

        return company
    }

    async getDepartmentId(company_name: string, department_name: string) {
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

    async getUserIdByEmail(query: UserQuery) {

        //Ensure that the company name and email is valid/not empty

        const userDetails = await this.prisma.employee.findUnique({
            where: {
                email: query.email,
                department: {
                    company: {
                        name: query.company
                    }
                }
            },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                        company: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        if (!userDetails) throw new NotFoundException(`User with the email of ${query.email} does not exist!`)

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
        Logger.log(company_record)
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
}
