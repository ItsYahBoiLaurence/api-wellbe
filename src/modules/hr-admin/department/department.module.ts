import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { HelperModule } from 'src/modules/helper/helper.module';

@Module({
  imports: [PrismaModule, HelperModule],
  controllers: [DepartmentController],
  providers: [DepartmentService]
})
export class DepartmentModule { }
