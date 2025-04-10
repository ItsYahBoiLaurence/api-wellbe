import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './modules/employee/employee.module';
import { HrAdminModule } from './modules/hr-admin/hr-admin.module';
@Module({
  imports: [EmployeeModule, HrAdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
