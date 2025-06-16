import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { CronService } from 'src/modules/cron/cron.service';
import { EmailerService } from 'src/modules/emailer/emailer.service';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';

@Injectable()
export class BatchService {
    private console = new Logger(BatchService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly helper: HelperService,
        private readonly cron: CronService,
        private readonly emailer: EmailerService
    ) { }

    async startBatch(user_data: JwtPayload) {

        const { company, role } = user_data

        if (role === "employee") throw new ForbiddenException()

        if (!company) throw new BadRequestException('Invalid Payload')

        const company_name = await this.helper.getCompany(company)

        const company_config = await this.helper.getCompanyConfig(company_name.name)

        const employees = await this.prisma.company.findUnique({
            where: {
                name: company
            },
            select: {
                departments: {
                    select: {
                        name: true,
                        employees: true
                    }
                }
            }
        })

        if (!employees) throw new NotFoundException(`${company} Company does not Exist!`)

        const employeeEmails = employees?.departments
            .flatMap(department => department.employees)
            .map(employees => employees.email)

        if (employeeEmails?.length === 0) throw new ConflictException(`There are no employees available in ${company} company`)

        const is_ready_for_new_batch = await this.helper.isReadyToReleaseNewBatch(company_name.name)

        if (is_ready_for_new_batch === false) throw new ConflictException('Previous Batch not yet finished.')

        const frequency = await this.prisma.settings.findFirst({
            where: {
                config_id: company_name.name
            }
        })

        if (!frequency) throw new ConflictException("No settings for this company")

        const daysToAdd = frequency.frequency == "DAILY" ? 1 : frequency.frequency == "WEEKLY" ? 7 : 0

        const start = new Date()
        start.setHours(start.getHours() + 8)
        const end = new Date(start)
        end.setDate(start.getDate() + (5 * daysToAdd))

        const newBatch = await this.prisma.batch_Record.create({
            data: {
                created_at: start,
                start_date: start,
                end_date: end,
                company_name: company_name.name,
                frequency: company_config.frequency
            }
        })

        if (!newBatch) throw new ConflictException('Batch generation failed!')

        //change the cronstring to 10 everyday and 10 every monday of the week
        const batch_frequency = newBatch.frequency === "DAILY" ? CronExpression.EVERY_DAY_AT_2AM
            : newBatch.frequency === "WEEKLY" ? "0 2 * * 1"
                : newBatch.frequency === "EVERY_HOUR" ? CronExpression.EVERY_HOUR
                    : newBatch.frequency === "EVERY_MINUTE" ? CronExpression.EVERY_MINUTE
                        : CronExpression.EVERY_DAY_AT_2AM


        employeeEmails.map(async (email) => {
            const questions = await this.helper.generateBatchQuestions()
            await this.prisma.employee_Under_Batch.create({
                data: {
                    email: email,
                    created_at: start,
                    question_bank: questions,
                    batch_id: newBatch.id,
                    department_id: await this.helper.getDepartmentIdByUserEmail(email)
                }
            })
        })

        if (!employeeEmails) throw new ConflictException('Batch generation failed!')

        employeeEmails.map(async (email) => {
            const user = await this.helper.getUserByEmail(email)
            const email_payload = {
                to: email,
                subject: "The Batch has Started",
                company: company_name.name,
                user: user.first_name
            }
            try {
                this.emailer.welcomeEmail(email_payload)
            } catch (error) {
                this.console.log(error)
            }
        })

        this.cron.addCronJob(company_name.name, employeeEmails, batch_frequency)

        return { message: "Batch started successfully!" }
    }

    async getBatch(user_data: JwtPayload) {
        const { company } = user_data
        const user_company = await this.helper.getCompany(company)
        const latest_batch = await this.prisma.batch_Record.findFirst({
            where: {
                company_name: user_company.name
            },
            orderBy: {
                created_at: 'desc'
            }
        })
        if (!latest_batch) return { is_completed: true }
        return latest_batch
    }
}