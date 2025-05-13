import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { EmailerService } from 'src/modules/emailer/emailer.service';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';
import { CsvParcerService } from 'src/modules/csv-parcer/csv-parcer.service';

@Injectable()
export class EmployeesService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly helper: HelperService,
        private readonly mail: EmailerService,
        private readonly parser: CsvParcerService) { }

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

    async sendInvite(user_data: JwtPayload, payload: { first_name: string, last_name: string, email: string, department: string }) {
        const { company } = user_data
        const user_comp = await this.helper.getCompany(company)

        try {
            // const hash = encryptData(finalPayload)
            const link = `http://localhost:3400/sign-up?email=${payload.email}&firstname=${payload.first_name}&lastname=${payload.last_name}&department=${payload.department}&company=${user_comp.name}`
            this.mail.inviteEmployee(payload.first_name, payload.email, user_comp.name, link)
            return { message: "Invite Sent" }
        } catch (e) {
            throw new e
        }
    }


    private async sendBulkInvites(
        items: InviteItem[],
        company: string
    ): Promise<InviteResult> {
        const successInvites: Array<{ item: InviteItem }> = [];
        const failedInvites: Array<{ item: InviteItem; missingFields: string[] }> = [];

        const requiredFields = ['email', 'first_name', 'last_name', 'department'] as const;

        for (const item of items) {
            // Check for missing or empty fields
            const missingFields = requiredFields.filter((key) => {
                const val = (item[key] ?? '').toString().trim();
                return val === '';
            });

            if (missingFields.length > 0) {
                failedInvites.push({ item, missingFields });
                continue; // skip sending invite for this item
            }

            try {
                const link = `http://localhost:3400/sign-up?email=${item.email}&firstname=${item.first_name}&lastname=${item.last_name}&department=${item.department}&company=${company}`
                this.mail.inviteEmployee(item.first_name, item.email, company, link)
                successInvites.push({ item });
            } catch (err) {
                // In case invite sending fails (e.g. email error), treat as failed
                failedInvites.push({ item, missingFields: ['send_error'] });
            }
        }

        return { successInvites, failedInvites };
    }

    async sendBulkInvite(user_data: JwtPayload, file: Buffer) {
        const { company } = user_data
        const user_comp = await this.helper.getCompany(company)
        const data = await this.parser.parseCsv(file)
        if (!data) throw new ConflictException("Cannot Parse CSV")
        return this.sendBulkInvites(data, user_comp.name)
    }
}
