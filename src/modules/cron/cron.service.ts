import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { JwtPayload } from 'src/types/jwt-payload';
import { CronJob } from 'cron'
import { PrismaService } from '../prisma/prisma.service';
import { HelperService } from '../helper/helper.service';
import { EmailerService } from '../emailer/emailer.service';
import { Exception } from 'handlebars';
import { ConfigService } from '@nestjs/config';
import { ResendMailerService } from '../resend-mailer/resend-mailer.service';
import { Resend } from 'resend';

@Injectable()
export class CronService implements OnModuleInit {

    private readonly console = new Logger(CronService.name);

    constructor(
        private readonly scheduleRegistry: SchedulerRegistry,
        private readonly prisma: PrismaService,
        private readonly helper: HelperService,
        private readonly config: ConfigService,
        private readonly resend: ResendMailerService
    ) {
    }

    onModuleInit() {
        this.getNotFinishedCompany()
    }

    private stringTransformer(text: string) {
        return text.toLowerCase().replace(' ', '-')
    }

    private CRON_STRING = {
        DAILY: CronExpression.EVERY_DAY_AT_2AM,
        WEEKLY: "0 2 * * 1",
        EVERY_HOUR: CronExpression.EVERY_HOUR,
        EVERY_MINUTE: CronExpression.EVERY_MINUTE,
    };

    private getCronString(freq: string) {
        return this.CRON_STRING[freq] || CronExpression.EVERY_DAY_AT_2AM
    }

    private async getNotFinishedCompany() {

        const companies = await this.prisma.batch_Record.findMany({
            where: {
                is_completed: false
            },
            select: {
                company_name: true,
                employees_under_batch: {
                    select: {
                        email: true
                    }
                },
                frequency: true
            }
        })

        if (!companies) throw new Exception("No Companies")
        for (const { company_name, employees_under_batch, frequency } of companies) {
            const emails = employees_under_batch.map(emp => emp.email)
            this.addCronJob(company_name, emails, this.getCronString(frequency))
        }
    }

    private async startCompanyCronJob(company_name: string, emails: string[]) {

        this.console.log("this is called")

        const company = await this.helper.getCompany(company_name)
        const batch = await this.helper.getLatestBatch(company.name)

        if (batch?.current_set_number >= 5) {
            await this.prisma.batch_Record.update({
                where: {
                    id: batch.id
                },
                data: {
                    is_completed: true
                }
            })
            this.scheduleRegistry.deleteCronJob(`${this.stringTransformer(company_name)}-company-job`)
            this.console.log("The Batch ended!")
            return
        }

        const left = `${(5 - (batch.current_set_number))}`

        const from = this.config.get<string>("RESEND_FROM_EMAIL")

        if (!from) throw Error("FROM email not configured!")

        const users = await this.prisma.employee.findMany({
            where: {
                email: {
                    in: emails
                }
            },
            select: {
                first_name: true,
                email: true
            }
        })

        const link = this.config.get<string>("INVITE_LINK")
        if (!link) throw Error("LINK email not configured!")

        const emailContents = users.map(({ email, first_name }) => {
            return {
                from,
                to: email,
                subject: 'Wellbe Reminder',
                html: this.helper.getReminderFormat(first_name, left, company.name, link)
            }
        })

        try {
            await this.resend.sendBulk(emailContents)
            await this.prisma.batch_Record.update({
                where: { id: batch?.id },
                data: { current_set_number: batch?.current_set_number + 1 }
            })

        } catch (e) {
            this.console.log(e)
            throw new e
        }
    }

    addCronJob(company: string, emails: string[], cronString: string) {
        const jobName = `${this.stringTransformer(company)}-company-job`

        if (this.scheduleRegistry.doesExist('cron', jobName)) {
            return { message: `CronJob already working under ${company}` }
        }

        const job = new CronJob(cronString, () => {
            this.startCompanyCronJob(company, emails)
        })

        this.scheduleRegistry.addCronJob(jobName, job)
        job.start()

        return { message: `CronJob for ${company} started` }
    }
}
