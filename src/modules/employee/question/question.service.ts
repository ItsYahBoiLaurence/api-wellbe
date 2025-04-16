import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Question } from '@prisma/client'
import { AnswerModel } from 'src/types/answer';
import { HelperService } from 'src/modules/helper/helper.service';

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

    // async createQuestions(data: Question) {
    //     const createdQuestions = await this.prisma.question.create({
    //         data
    //     });
    //     return createdQuestions;
    // }

    async generateQuestion() {
        return this.helper.generateBatchQuestions()
    }

    async submitAnswers(data: AnswerModel[]) {
        if (!data) return { message: 'No Data Submitted' }
        return data
    }

}
