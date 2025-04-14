import { Module } from '@nestjs/common';
import { MayanAdminService } from './mayan-admin.service';
import { MayanAdminController } from './mayan-admin.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MayanAdminService],
  controllers: [MayanAdminController]
})
export class MayanAdminModule { }
