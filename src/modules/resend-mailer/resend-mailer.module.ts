import { Module } from '@nestjs/common';
import { ResendMailerService } from './resend-mailer.service';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../prisma/prisma.module';
import { HelperModule } from '../helper/helper.module';
import { CsvParcerModule } from '../csv-parcer/csv-parcer.module';

@Module({
  providers: [ResendMailerService],
  exports: [ResendMailerService],
  imports: [
    CsvParcerModule,
    HelperModule,
    ConfigModule,
    BullModule.registerQueue(
      { name: 'email' }
    )
  ]
})
export class ResendMailerModule { }
