import { Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [HelperService],
  exports: [HelperService]
})
export class HelperModule { }
