import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { HelperModule } from 'src/modules/helper/helper.module';

@Module({
  imports: [PrismaModule, HelperModule],
  providers: [BatchService],
  controllers: [BatchController]
})
export class BatchModule { }
