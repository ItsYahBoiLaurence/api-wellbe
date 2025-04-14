import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Question } from '@prisma/client'
import { AnswerModel } from 'src/types/answer';

@Injectable()
export class QuestionService {
    constructor(private readonly prisma: PrismaService) { }

    private async generateBatchQuestions() {
        try {
            const questions = await this.prisma.question.findMany({
                select: {
                    id: true,
                    domain: true
                }
            });

            const employees = await this.prisma.employee.findMany({
                where: {

                }
            })

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

    async getAllQuestions(domain?: string): Promise<Question[]> {

        return this.prisma.question.findMany({
            where: domain ? { domain } : undefined
        });
    }

    // async createQuestions(data: Question) {
    //     const createdQuestions = await this.prisma.question.create({
    //         data
    //     });
    //     return createdQuestions;
    // }

    async generateQuestion() {
        return this.generateBatchQuestions()
    }

    async submitAnswers(data: AnswerModel[]) {
        if (!data) return { message: 'No Data Submitted' }
        return data
    }

}
