import { InjectQueue } from '@nestjs/bull';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { EmailData } from 'src/types/resend';
import { BulkUsers, EmailOptions, InviteData } from 'src/types/invite';
import { JwtPayload } from 'src/types/jwt-payload';
import { HelperService } from '../helper/helper.service';
import { ConfigService } from '@nestjs/config';
import { EmailContent } from 'src/types/email';
import { CsvParcerService } from '../csv-parcer/csv-parcer.service';

@Injectable()
export class ResendMailerService {
    private readonly logger = new Logger(ResendMailerService.name)

    constructor(
        @InjectQueue('email') private emailQueue: Queue,
        private readonly helper: HelperService,
        private readonly configService: ConfigService,
        private readonly parser: CsvParcerService
    ) { }

    async sendSingleInvite(user_data: JwtPayload, inviteData: InviteData) {
        const { company } = user_data
        const { email, first_name, last_name, department } = inviteData
        const user_company = await this.helper.getCompany(company)
        const domain_link = this.configService.get<string>("INVITE_LINK")
        try {
            const link = `${domain_link}/sign-up?email=${email}&firstname=${first_name}&lastname=${last_name}&department=${department}&company=${user_company.name}`
            const emailOption: EmailOptions = {
                to: email,
                subject: "You're Invited! Discover Your Workplace Wellbeing with Wellbe.",
                content: {
                    user: first_name,
                    company: user_company.name,
                    link
                }
            }
            await this.emailQueue.add('send-single-invite', emailOption)
            return { success: true, message: "Email Queued" }
        } catch (error) {
            this.logger.error(error)
            throw new ConflictException(error)
        }
    }

    async sendBulkEmail(user_data: JwtPayload, file: Buffer) {
        const { company } = user_data
        const { name } = await this.helper.getCompany(company)
        const data: InviteData[] = await this.parser.parseCsv(file)
        if (!data) throw new ConflictException("Can't Parse CSV")
        const bulkUser: BulkUsers = {
            subject: "You've been invited",
            company: name,
            listOfUsers: data
        }
        try {
            await this.emailQueue.add('send-bulk-invite', bulkUser)
            return { message: 'Email Queued', success: true }
        }
        catch (error) {
            throw error
        }
    }
}
