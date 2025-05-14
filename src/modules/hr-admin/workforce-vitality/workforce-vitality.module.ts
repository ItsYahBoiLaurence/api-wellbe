import { Module } from '@nestjs/common';
import { WorkforceVitalityService } from './workforce-vitality.service';
import { WorkforceVitalityController } from './workforce-vitality.controller';
import { CsvParcerModule } from 'src/modules/csv-parcer/csv-parcer.module';
import { HelperModule } from 'src/modules/helper/helper.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  imports: [CsvParcerModule, HelperModule, PrismaModule],
  providers: [WorkforceVitalityService],
  controllers: [WorkforceVitalityController]
})
export class WorkforceVitalityModule { }
