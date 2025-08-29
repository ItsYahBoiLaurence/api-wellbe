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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/auth.guard';
import { CronModule } from './modules/cron/cron.module';
import { EmailerModule } from './modules/emailer/emailer.module';
import { OpenaiModule } from './modules/openai/openai.module';
import { CsvParcerModule } from './modules/csv-parcer/csv-parcer.module';
import { ResendMailerModule } from './modules/resend-mailer/resend-mailer.module';
import { BullModule } from '@nestjs/bull';
import { WorkersModule } from './modules/workers/workers.module';

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
    OpenaiModule,
    CsvParcerModule,
    ResendMailerModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
          tls: {}
        },
        // FREE TIER OPTIMIZATIONS
        defaultJobOptions: {
          removeOnComplete: true,    // Keep fewer completed jobs
          removeOnFail: true,        // Keep fewer failed jobs  
          attempts: 3,            // Fewer retry attempts
          backoff: {
            type: 'fixed',        // Simpler backoff
            delay: 10000,
          },
        },

        // Connection optimizations
        settings: {
          stalledInterval: 60000,  // Check less frequently
          maxStalledCount: 1,
          maxRetriesPerRequest: null
        },
      }),
    }),
    WorkersModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule { }
