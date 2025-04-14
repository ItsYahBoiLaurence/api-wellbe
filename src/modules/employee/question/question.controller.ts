import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QuestionService } from './question.service';
import { Question } from '@prisma/client';
import { AnswerModel } from 'src/types/answer';

@Controller('employee/question')
export class QuestionController {

    constructor(private readonly questionService: QuestionService) { }

    @Get()
    getAllQuestions() {
        return this.questionService.generateQuestion()
    }

    @Post()
    submitAnswer(@Body() payload: AnswerModel[]) {
        return this.questionService.submitAnswers(payload)
    }
}
