import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { EmailProcessor } from './worker/email.processor';

@Module({
    imports: [
        BullModule.registerQueue(
            { name: 'email' }
        )
    ],
    providers: [EmailProcessor]
})
export class WorkersModule { }
