import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class BatchService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly helper: HelperService
    ) { }

    async startBatch(company: string) {

        if (!company) throw new BadRequestException('Invalid Payload')

        const company_name = await this.helper.getCompany(company)

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

        const start = new Date()
        start.setHours(start.getHours() + 8)
        const end = new Date(start)
        end.setDate(start.getDate() + 7)

        const newBatch = await this.prisma.batch_Record.create({
            data: {
                created_at: start,
                start_date: start,
                end_date: end,
                company_name: company_name.name
            }
        })

        if (!newBatch) throw new ConflictException('Batch generation failed!')

        employeeEmails.map(async (email) => {
            const questions = await this.helper.generateBatchQuestions()
            await this.prisma.employee_Under_Batch.create({
                data: {
                    email: email,
                    question_bank: questions,
                    answer_bank: questions,
                    batch_id: newBatch.id,
                }
            })
        })

        if (!employeeEmails) throw new ConflictException('Batch generation failed!')

        return { message: "Batch started successfully!" }
    }
}