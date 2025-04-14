import { Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [HelperService],
  exports: [HelperService]
})
export class HelperModule { }
