import { InjectQueue } from '@nestjs/bull';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { EmailData } from 'src/types/resend';
import { BulkUsers, EmailOptions, InviteData } from 'src/types/invite';
import { JwtPayload } from 'src/types/jwt-payload';
import { HelperService } from '../helper/helper.service';
import { ConfigService } from '@nestjs/config';
import { EmailContent, ResendEmail } from 'src/types/email';
import { CsvParcerService } from '../csv-parcer/csv-parcer.service';
import { Resend } from 'resend';

@Injectable()
export class ResendMailerService {
    private readonly logger = new Logger(ResendMailerService.name)

    private resend: Resend

    constructor(
        @InjectQueue('email') private emailQueue: Queue,
        private readonly helper: HelperService,
        private readonly configService: ConfigService,
        private readonly parser: CsvParcerService
    ) {
        this.resend = new Resend(configService.get<string>('RESEND_API_KEY'))
    }

    async sendBulk(emailContent: ResendEmail[]) {
        try {
            const email = await this.resend.batch.send(emailContent)
            return email
        } catch (e) {
            throw new e
        }
    }

    async sendEmail(emailContent: ResendEmail) {
        try {
            const email = await this.resend.emails.send(emailContent)
            return email
        } catch (e) {
            throw new e
        }
    }














}
