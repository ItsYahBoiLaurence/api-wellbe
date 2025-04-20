import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Question } from '@prisma/client'
import { AnswerModel } from 'src/types/answer';
import { HelperService } from 'src/modules/helper/helper.service';
import { UserPayload } from 'src/types/payload';

@Injectable()
export class QuestionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly helper: HelperService
    ) { }


    async getAllQuestions(domain?: string): Promise<Question[]> {

        return this.prisma.question.findMany({
            where: domain ? { domain } : undefined
        });
    }

    async generateQuestion(payload: UserPayload) {

        const { company, email } = payload

        if (!company || !email) throw new BadRequestException("Invalid Payload")

        const company_name = await this.helper.getCompany(company)

        const batch = await this.helper.getLatestBatch(company_name.name)

        if (batch?.is_completed === true) throw new ConflictException("Batch Completed!")

        if (!batch) throw new NotFoundException("No Batch Available!")

        const user = await this.prisma.employee_Under_Batch.findFirst({
            where: {
                batch_id: batch.id,
                email
            }
        })

        if (!user) throw new NotFoundException("User not found!")

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

    async submitAnswers(data: AnswerModel[], user_data: UserPayload) {

        if (!data || !user_data) throw new BadRequestException("Invalid Payload!")

        const { email, company } = user_data

        const company_name = await this.helper.getCompany(company)

        const batch = await this.helper.getLatestBatch(company_name.name)

        if (!batch) throw new NotFoundException("No Batch Available!")

        const user = await this.prisma.employee_Under_Batch.findFirst({
            where: {
                batch_id: batch.id,
                email
            }
        })

        if (!user) throw new NotFoundException("User not in the Batch!")


        if (user.set_participation?.[batch.current_set_number - 1] === true) throw new ConflictException('You already submitted your answer!')

        const user_answer = await this.prisma.answer.create({
            data: {
                answer: data,
                employee_id: user?.id
            }
        })

        if (user && Array.isArray(user.set_participation)) {
            const updatedPayload = [...user.set_participation]
            updatedPayload[batch.current_set_number - 1] = true

            await this.prisma.employee_Under_Batch.update({
                where: {
                    email_batch_id: {
                        batch_id: batch.id,
                        email
                    }
                },
                data: {
                    set_participation: updatedPayload
                }
            })
        }


        return user_answer
    }
}