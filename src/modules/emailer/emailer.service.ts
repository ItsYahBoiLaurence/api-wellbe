import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailerService {
    constructor(private readonly mailerService: MailerService) { }

    async sendEmail() {
        await this.mailerService.sendMail({
            to: "johnlaurenceburgos@gmail.com",
            subject: "Welcome to Wellbe",
            text: "Hello john laurence burgos"
        })
    }
}
