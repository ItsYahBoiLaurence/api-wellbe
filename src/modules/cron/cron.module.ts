import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HelperModule } from '../helper/helper.module';
import { EmailerModule } from '../emailer/emailer.module';

@Module({
    imports: [ScheduleModule.forRoot(), PrismaModule, HelperModule, EmailerModule],
    providers: [CronService],
    exports: [CronService]
})
export class CronModule { }
