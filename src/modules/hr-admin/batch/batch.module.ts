import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { HelperModule } from 'src/modules/helper/helper.module';
import { CronModule } from 'src/modules/cron/cron.module';

@Module({
  imports: [PrismaModule, HelperModule, CronModule],
  providers: [BatchService],
  controllers: [BatchController]
})
export class BatchModule { }
