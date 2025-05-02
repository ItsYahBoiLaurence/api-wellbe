import { Module } from '@nestjs/common';
import { TipService } from './tip.service';
import { TipController } from './tip.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { HelperModule } from 'src/modules/helper/helper.module';

@Module({
  imports: [PrismaModule, HelperModule],
  providers: [TipService],
  controllers: [TipController]
})
export class TipModule { }
