import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [OpenaiService],
  imports: [ConfigModule],
  exports: [OpenaiService]
})
export class OpenaiModule { }
