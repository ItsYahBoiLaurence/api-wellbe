import { Controller, Get } from '@nestjs/common';
import { QuestionService } from './question.service';

@Controller('employee/question')
export class QuestionController {

    constructor(private readonly questionService: QuestionService) { }

    @Get()
    getAllQuestions() {
        return this.questionService.getAllQuestions()
    }
}
