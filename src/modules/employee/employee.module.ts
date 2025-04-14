import { Module } from '@nestjs/common';
import { QuestionModule } from './question/question.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [QuestionModule, UserModule]
})
export class EmployeeModule { }
