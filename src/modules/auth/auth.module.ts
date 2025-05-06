import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { HelperModule } from '../helper/helper.module';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1y' },
        global: true
      })
    }),
    UserModule,
    PrismaModule,
    HelperModule,
  ],
  exports: [AuthService, AuthGuard, JwtModule]
})
export class AuthModule { }
