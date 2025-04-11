import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QuestionService } from './question.service';
import { Question } from '@prisma/client';

@Controller('employee/question')
export class QuestionController {

    constructor(private readonly questionService: QuestionService) { }

    @Get()
    getAllQuestions() {
        return this.questionService.generateQuestion()
    }

    @Post()
    async createQuestions(@Body() questions: Question) {
        const createdQuestions = await this.questionService.createQuestions(questions);
        return createdQuestions;
    }

}
