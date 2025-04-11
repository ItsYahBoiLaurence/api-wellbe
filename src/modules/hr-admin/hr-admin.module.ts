import { Module } from '@nestjs/common';
import { DepartmentModule } from './department/department.module';

@Module({
  imports: [DepartmentModule]
})
export class HrAdminModule {}
