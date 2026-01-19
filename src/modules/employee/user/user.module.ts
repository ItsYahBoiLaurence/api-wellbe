import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { HelperModule } from 'src/modules/helper/helper.module';
import { EmailerModule } from 'src/modules/emailer/emailer.module';
import { ConfigModule } from '@nestjs/config';
import { ResendMailerModule } from 'src/modules/resend-mailer/resend-mailer.module';

@Module({
  imports: [PrismaModule, HelperModule, EmailerModule, ConfigModule, ResendMailerModule],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule { }
