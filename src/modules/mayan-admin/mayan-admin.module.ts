import { Module } from '@nestjs/common';
import { MayanAdminService } from './mayan-admin.service';
import { MayanAdminController } from './mayan-admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HelperModule } from '../helper/helper.module';
import { UserModule } from '../user/user.module';
import { CronModule } from '../cron/cron.module';
import { EmailerModule } from '../emailer/emailer.module';
import { OpenaiModule } from '../openai/openai.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, HelperModule, UserModule, CronModule, HelperModule, EmailerModule, OpenaiModule, ConfigModule, AuthModule],
  providers: [MayanAdminService],
  controllers: [MayanAdminController]
})
export class MayanAdminModule { }
