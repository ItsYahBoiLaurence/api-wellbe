import { Module } from '@nestjs/common';
import { QuestionModule } from './question/question.module';
import { UserModule } from './user/user.module';
import { TipModule } from './tip/tip.module';

@Module({
  imports: [QuestionModule, UserModule, TipModule]
})
export class EmployeeModule { }
