import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { JwtPayload } from 'src/types/jwt-payload';
import { CronJob } from 'cron'
import { PrismaService } from '../prisma/prisma.service';
import { HelperService } from '../helper/helper.service';

@Injectable()
export class CronService {

    constructor(
        private readonly scheduleRegistry: SchedulerRegistry,
        private readonly prisma: PrismaService,
        private readonly helper: HelperService
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

        const job = new CronJob(CronExpression.EVERY_10_SECONDS, () => {
            this.startCompanyCronJob(company, emails)
        })

        this.scheduleRegistry.addCronJob(jobName, job)
        job.start()

        return { message: `CronJob for ${company} started` }
    }
}
