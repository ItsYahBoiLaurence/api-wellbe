import { Module } from '@nestjs/common';
import { WellbeingService } from './wellbeing.service';
import { WellbeingController } from './wellbeing.controller';
import { HelperModule } from 'src/modules/helper/helper.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  imports: [HelperModule, PrismaModule],
  providers: [WellbeingService],
  controllers: [WellbeingController]
})
export class WellbeingModule { }
