import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Question } from '@prisma/client'
import { AnswerModel } from 'src/types/answer';
import { HelperService } from 'src/modules/helper/helper.service';
import { JwtPayload } from 'src/types/jwt-payload';
import { OpenaiService } from 'src/modules/openai/openai.service';
import { randomFill } from 'crypto';

@Injectable()
export class QuestionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly helper: HelperService,
        private readonly ai: OpenaiService
    ) { }

    private async getMissedQuestion(arr: [], batch_num: number) {
        for (let i = 0; i < batch_num - 1; i++) {
            if (arr[i] === false) {
                return i
            }
        }
        return null
    }

    async generateQuestion(user_jwt: JwtPayload) {

        const { company, sub } = user_jwt

        const company_name = await this.helper.getCompany(company)

        const batch = await this.helper.getLatestBatch(company_name.name)

        if (batch?.is_completed === true) throw new ConflictException("Batch Completed!")

        if (!batch) throw new NotFoundException("No Batch Available!")

        const user = await this.prisma.employee_Under_Batch.findFirst({
            where: {
                batch_id: batch.id,
                email: sub
            }
        })

        if (!user) throw new NotFoundException("User not found!")

        const missed = await this.getMissedQuestion(user.set_participation as [], batch.current_set_number)

        if (missed !== null) {
            const missed_question_indeces = user.question_bank?.[missed]
            const questions = await this.prisma.question.findMany({
                where: {
                    id: {
                        in: missed_question_indeces
                    }
                },
                select: {
                    id: true,
                    question: true
                }
            })
            if (!questions) throw new ConflictException("No Questionss Available!")
            return questions
        }

        if (user.set_participation?.[batch.current_set_number - 1] === true) throw new ConflictException('No question available!')

        if (Array.isArray(user.set_participation)) {
            const participation = [...user.set_participation]
            if (participation[participation.length - 1] === true) throw new ConflictException("You don't have any Questions left in the bank!")
        }

        const question_indeces = user.question_bank?.[batch.current_set_number - 1]

        const questions = await this.prisma.question.findMany({
            where: {
                id: {
                    in: question_indeces
                }
            },
            select: {
                id: true,
                question: true
            }
        })

        return questions
    }

    async submitAnswers(data: AnswerModel[], user_data: JwtPayload) {

        if (!data || !user_data) throw new BadRequestException("Invalid Payload!")

        const { sub, company } = user_data

        const company_name = await this.helper.getCompany(company)

        const batch = await this.helper.getLatestBatch(company_name.name)

        if (!batch) throw new NotFoundException("No Batch Available!")

        const user = await this.prisma.employee_Under_Batch.findUnique({
            where: {
                email_batch_id: {
                    batch_id: batch.id,
                    email: sub
                }
            }
        })

        if (!user) throw new NotFoundException("User not in the Batch!")

        const missed = await this.getMissedQuestion(user.set_participation as [], batch.current_set_number)

        if (missed !== null) {
            await this.prisma.answer.create({
                data: {
                    answer: data,
                    employee_id: user.id
                }
            })

            if (Array.isArray(user.set_participation)) {
                const updatedPayload = [...user.set_participation]
                updatedPayload[missed] = true

                await this.prisma.employee_Under_Batch.update({
                    where: {
                        email_batch_id: {
                            batch_id: batch.id,
                            email: sub
                        }
                    },
                    data: {
                        set_participation: updatedPayload
                    }
                })
            }

            this.helper.userCompletedTheBatch(sub, batch.id)

            const advices = await this.helper.getAdviceForUser(data)


            const tip = await this.ai.generateTip(advices)

            if (!tip) throw new ConflictException("Error generating Advice!")

            const [newTip, newInbox] = await Promise.all([
                await this.prisma.tips.create({
                    data: {
                        user: user.email,
                        tip,
                        created_at: this.helper.getCurrentDate(),
                        batch_created: batch.id
                    }
                }),
                await this.prisma.inbox.create({
                    data: {
                        receiver: user.email,
                        body: tip,
                        created_at: this.helper.getCurrentDate(),
                        subject: "Wellbe Tip",
                        tag: "tip"
                    }
                })
            ])


            if (!newTip) throw new ConflictException("Error saving tip!")
            if (!newInbox) throw new ConflictException("Error saving inbox")

            return { message: "Answer submitted successfully!" }
        }


        if (user.set_participation?.[batch.current_set_number - 1] === true) throw new ConflictException('You already submitted your answer!')

        await this.prisma.answer.create({
            data: {
                answer: data,
                employee_id: user.id
            }
        })

        if (Array.isArray(user.set_participation)) {
            const updatedPayload = [...user.set_participation]
            updatedPayload[batch.current_set_number - 1] = true

            await this.prisma.employee_Under_Batch.update({
                where: {
                    email_batch_id: {
                        batch_id: batch.id,
                        email: sub
                    }
                },
                data: {
                    set_participation: updatedPayload
                }
            })
        }

        this.helper.userCompletedTheBatch(sub, batch.id)

        const advices = await this.helper.getAdviceForUser(data)


        const tip = await this.ai.generateTip(advices)

        if (!tip) throw new ConflictException("Error generating Advice!")

        const [newTip, newInbox] = await Promise.all([
            await this.prisma.tips.create({
                data: {
                    user: user.email,
                    tip,
                    created_at: this.helper.getCurrentDate(),
                    batch_created: batch.id
                }
            }),
            await this.prisma.inbox.create({
                data: {
                    receiver: user.email,
                    body: tip,
                    created_at: this.helper.getCurrentDate(),
                    subject: "Wellbe Tip",
                    tag: "tip"
                }
            })
        ])

        if (!newTip) throw new ConflictException("Error saving tip!")
        if (!newInbox) throw new ConflictException("Error saving inbox")

        return { message: "Answer submitted successfully!" }
    }
}