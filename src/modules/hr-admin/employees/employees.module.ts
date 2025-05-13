import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { HelperModule } from 'src/modules/helper/helper.module';
import { EmailerModule } from 'src/modules/emailer/emailer.module';
import { CsvParcerModule } from 'src/modules/csv-parcer/csv-parcer.module';

@Module({
  imports: [PrismaModule, HelperModule, EmailerModule, CsvParcerModule],
  providers: [EmployeesService],
  controllers: [EmployeesController]
})
export class EmployeesModule { }
