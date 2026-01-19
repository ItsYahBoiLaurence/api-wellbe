import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { HelperModule } from 'src/modules/helper/helper.module';
import { CronModule } from 'src/modules/cron/cron.module';
import { EmailerModule } from 'src/modules/emailer/emailer.module';
import { ResendMailerModule } from 'src/modules/resend-mailer/resend-mailer.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, HelperModule, CronModule, EmailerModule, ResendMailerModule, ConfigModule],
  providers: [BatchService],
  controllers: [BatchController]
})
export class BatchModule { }
