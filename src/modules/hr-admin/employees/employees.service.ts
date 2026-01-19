import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { EmailerService } from 'src/modules/emailer/emailer.service';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';
import { CsvParcerService } from 'src/modules/csv-parcer/csv-parcer.service';
import { ConfigService } from '@nestjs/config';
import { ResendMailerService } from 'src/modules/resend-mailer/resend-mailer.service';
import { InviteData } from 'src/types/invite';
import { ResendEmail } from 'src/types/email';

@Injectable()
export class EmployeesService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly helper: HelperService,
        private readonly parser: CsvParcerService,
        private readonly configService: ConfigService,
        private readonly resend: ResendMailerService
    ) { }

    async getAllEmployees(user_data: JwtPayload, department: string) {

        const { company } = user_data
        const user_company = await this.helper.getCompany(company)

        const user_department = department ?? undefined

        const employees = this.prisma.employee.findMany({
            where: {
                department: {
                    name: user_department,
                    company: {
                        name: user_company.name
                    }
                }
            },
            select: {
                first_name: true,
                last_name: true,
                email: true,
                department: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!employees) return { message: "Company does not exist!" }

        return employees
    }

    async sendSingleInvite(user_data: JwtPayload, payload: InviteData) {
        const { company } = user_data
        const { name } = await this.helper.getCompany(company)
        const domain_link = this.configService.get<string>("INVITE_LINK")
        const from = this.configService.get<string>("RESEND_FROM_EMAIL")
        if (!from) throw new ConflictException("From email not set!")
        const link = `${domain_link}sign-up?email=${payload.email}&firstname=${payload.first_name}&lastname=${payload.last_name}&department=${payload.department}&company=${name}`
        console.log(link)

        const emailOptions: ResendEmail = {
            to: payload.email,
            from,
            subject: "Wellbe Invitation",
            html: this.helper.getInviteFormat(payload.first_name, link, name)
        }

        try {
            const { error } = await this.resend.sendEmail(emailOptions)
            if (error) throw new ConflictException(error)
            return { success: true, message: 'Invite Success' }
        } catch (e) {
            console.log(e)
            throw new ConflictException(e)
        }
    }

    async sendBulkInvite(user_details: JwtPayload, file: Express.Multer.File) {
        const { company } = user_details
        const user_company = await this.helper.getCompany(company)

        const data: InviteData[] = await this.parser.parseCsv(file.buffer)
        if (!data) throw new ConflictException("Can't Parse CSV")

        const domain_link = this.configService.get<string>("INVITE_LINK")
        if (!domain_link) throw new ConflictException("Invite Link not set!")

        const from = this.configService.get<string>("RESEND_FROM_EMAIL")
        if (!from) throw new ConflictException("from not set!")

        const bulkMailData: ResendEmail[] = data.map(({ email, first_name, last_name, department }) => {
            const link = `${domain_link}sign-up?email=${email}&firstname=${first_name}&lastname=${last_name}&department=${department}&company=${user_company.name}`
            return {
                to: email,
                subject: "Wellbe Invitation",
                from,
                html: this.helper.getInviteFormat(first_name, link, user_company.name)
            }
        })

        try {
            const { error } = await this.resend.sendBulk(bulkMailData)
            if (error) throw new ConflictException(error)
            return { success: true, message: "Bulk Invite Success!" }
        } catch (e) {
            console.log(e)
            throw new ConflictException(e)
        }
    }
}
