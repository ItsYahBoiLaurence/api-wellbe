import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { HelperModule } from 'src/modules/helper/helper.module';


@Module({
  imports: [PrismaModule, HelperModule],
  providers: [QuestionService],
  controllers: [QuestionController]
})
export class QuestionModule { }
