import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { HelperModule } from 'src/modules/helper/helper.module';

@Module({
  imports: [PrismaModule, HelperModule],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule { }
