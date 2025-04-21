import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QuestionService } from './question.service';
import { AnswerModel } from 'src/types/answer';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';

@Controller('employee/question')
export class QuestionController {

    constructor(private readonly questionService: QuestionService) { }

    @Get()
    getQuestion(@CurrentUser() user_data: JwtPayload) {
        return this.questionService.generateQuestion(user_data)
    }

    @Post()
    submitAnswer(@Body() payload: AnswerModel[], @CurrentUser() user_data: JwtPayload) {
        return this.questionService.submitAnswers(payload, user_data)
    }
}
