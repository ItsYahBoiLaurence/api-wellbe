import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { JwtPayload } from 'src/types/jwt-payload';
import { CronJob } from 'cron'
import { PrismaService } from '../prisma/prisma.service';
import { HelperService } from '../helper/helper.service';
import { EmailerService } from '../emailer/emailer.service';
import { Subject } from 'rxjs';

@Injectable()
export class CronService {

    constructor(
        private readonly scheduleRegistry: SchedulerRegistry,
        private readonly prisma: PrismaService,
        private readonly helper: HelperService,
        private readonly emailer: EmailerService
    ) { }

    private stringTransformer(text: string) {
        return text.toLowerCase().replace(' ', '-')
    }

    private async startCompanyCronJob(company_name: string, emails: string[]) {
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
            Logger.log("The Batch ended!")
            return
        }

        Logger.log("===========")
        Logger.log(`Questions were sent for the Batch ${batch.current_set_number + 1}`)
        Logger.log("===========")

        Logger.log("===========")
        Logger.log(emails)
        Logger.log("===========")

        const left = `${(5 - (batch.current_set_number + 1)) == 0 ? "no" : (5 - (batch.current_set_number + 1))}`
        emails.map(async (email) => {
            const user = await this.helper.getUserByEmail(email)
            if (!user) Logger.log('No user')
            const email_data = {
                to: email,
                subject: "Wellbe Reminder",
                company: company.name,
                user: user?.first_name as string,
                left
            }

            try {
                await this.emailer.reminderEmail(email_data)
            } catch (error) {
                Logger.log(`Error sending email to ${email}`)
                Logger.log(`error`)
            }
        })

        await this.prisma.batch_Record.update({
            where: { id: batch?.id },
            data: { current_set_number: batch?.current_set_number + 1 }
        })
    }

    addCronJob(company: string, emails: string[]) {
        const jobName = `${this.stringTransformer(company)}-company-job`

        if (this.scheduleRegistry.doesExist('cron', jobName)) {
            return { message: `CronJob already working under ${company}` }
        }

        const job = new CronJob(CronExpression.EVERY_MINUTE, () => {
            this.startCompanyCronJob(company, emails)
        })

        this.scheduleRegistry.addCronJob(jobName, job)
        job.start()

        return { message: `CronJob for ${company} started` }
    }
}
