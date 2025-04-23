import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './modules/employee/employee.module';
import { HrAdminModule } from './modules/hr-admin/hr-admin.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { MayanAdminModule } from './modules/mayan-admin/mayan-admin.module';
import { HelperModule } from './modules/helper/helper.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/auth.guard';
import { CronModule } from './modules/cron/cron.module';
import { EmailerModule } from './modules/emailer/emailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EmployeeModule,
    HrAdminModule,
    PrismaModule,
    MayanAdminModule,
    HelperModule,
    AuthModule,
    UserModule,
    CronModule,
    EmailerModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule { }
