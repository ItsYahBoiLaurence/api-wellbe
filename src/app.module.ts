import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './modules/employee/employee.module';
import { HrAdminModule } from './modules/hr-admin/hr-admin.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { MayanAdminModule } from './modules/mayan-admin/mayan-admin.module';
import { HelperModule } from './modules/helper/helper.module';

@Module({
  imports: [EmployeeModule, HrAdminModule, PrismaModule, MayanAdminModule, HelperModule,],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
