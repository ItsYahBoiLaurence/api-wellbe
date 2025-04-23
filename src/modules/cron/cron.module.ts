import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HelperModule } from '../helper/helper.module';

@Module({
    imports: [ScheduleModule.forRoot(), PrismaModule, HelperModule],
    providers: [CronService],
    exports: [CronService]
})
export class CronModule { }
