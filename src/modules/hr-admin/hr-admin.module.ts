import { Module } from '@nestjs/common';
import { DepartmentModule } from './department/department.module';
import { EmployeesModule } from './employees/employees.module';
import { BatchModule } from './batch/batch.module';

@Module({
  imports: [DepartmentModule, EmployeesModule, BatchModule]
})
export class HrAdminModule {}
