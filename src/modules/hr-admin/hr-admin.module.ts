import { Module } from '@nestjs/common';
import { DepartmentModule } from './department/department.module';
import { EmployeesModule } from './employees/employees.module';
import { BatchModule } from './batch/batch.module';
import { SettingsModule } from './settings/settings.module';
import { ParticipationRateModule } from './participation-rate/participation-rate.module';
import { WellbeingModule } from './wellbeing/wellbeing.module';

@Module({
  imports: [DepartmentModule, EmployeesModule, BatchModule, SettingsModule, ParticipationRateModule, WellbeingModule]
})
export class HrAdminModule {}
