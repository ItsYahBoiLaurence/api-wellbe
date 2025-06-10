import { Module } from '@nestjs/common';
import { EmailerService } from './emailer.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { HelperModule } from '../helper/helper.module';

@Module({
  providers: [EmailerService],
  imports: [
    ConfigModule,
    HelperModule,
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: true,
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"no-reply"<${configService.get<string>('EMAIL_FROM')}>`,
        }
      })
    })
  ],
  exports: [EmailerService]
})
export class EmailerModule { }
