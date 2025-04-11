import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Question } from '@prisma/client'

@Injectable()
export class QuestionService {
    constructor(private readonly prisma: PrismaService) { }

    async getAllQuestions(): Promise<Question[]> {
        return this.prisma.question.findMany();
    }
}
