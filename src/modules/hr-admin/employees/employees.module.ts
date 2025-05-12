import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { HelperModule } from 'src/modules/helper/helper.module';

@Module({
  imports: [PrismaModule, HelperModule],
  providers: [EmployeesService],
  controllers: [EmployeesController]
})
export class EmployeesModule { }
