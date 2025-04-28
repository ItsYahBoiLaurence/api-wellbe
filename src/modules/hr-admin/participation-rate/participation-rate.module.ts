import { Module } from '@nestjs/common';
import { ParticipationRateService } from './participation-rate.service';
import { ParticipationRateController } from './participation-rate.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { HelperModule } from 'src/modules/helper/helper.module';

@Module({
  providers: [ParticipationRateService],
  controllers: [ParticipationRateController],
  imports: [PrismaModule, HelperModule]
})
export class ParticipationRateModule { }
