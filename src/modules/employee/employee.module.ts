import { Module } from '@nestjs/common';
import { QuestionModule } from './question/question.module';
import { UserModule } from './user/user.module';
import { TipModule } from './tip/tip.module';
import { InboxModule } from './inbox/inbox.module';
import { CheckInModule } from './check-in/check-in.module';

@Module({
  imports: [QuestionModule, UserModule, TipModule, InboxModule, CheckInModule]
})
export class EmployeeModule { }
