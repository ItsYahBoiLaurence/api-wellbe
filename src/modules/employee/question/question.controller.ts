import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QuestionService } from './question.service';
import { AnswerModel } from 'src/types/answer';
import { UserPayload } from 'src/types/payload';

@Controller('employee/question')
export class QuestionController {

    constructor(private readonly questionService: QuestionService) { }

    @Get()
    getQuestion(@Query() payload: UserPayload) {
        return this.questionService.generateQuestion(payload)
    }

    @Post()
    submitAnswer(@Body() payload: AnswerModel[], @Query() user_data: UserPayload) {
        return this.questionService.submitAnswers(payload, user_data)
    }
}
