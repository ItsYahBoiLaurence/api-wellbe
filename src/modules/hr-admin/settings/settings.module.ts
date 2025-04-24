import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { HelperModule } from 'src/modules/helper/helper.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  providers: [SettingsService],
  controllers: [SettingsController],
  imports: [HelperModule, PrismaModule]
})
export class SettingsModule { }
