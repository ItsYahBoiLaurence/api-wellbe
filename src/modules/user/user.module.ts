import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HelperModule } from '../helper/helper.module';

@Module({
  imports: [PrismaModule, HelperModule],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
