import { Module } from '@nestjs/common';
import { MayanAdminService } from './mayan-admin.service';
import { MayanAdminController } from './mayan-admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HelperModule } from '../helper/helper.module';
import { UserModule } from '../user/user.module';
import { AuthService } from '../auth/auth.service';
import { CronModule } from '../cron/cron.module';

@Module({
  imports: [PrismaModule, HelperModule, UserModule, CronModule, HelperModule],
  providers: [MayanAdminService],
  controllers: [MayanAdminController]
})
export class MayanAdminModule { }
