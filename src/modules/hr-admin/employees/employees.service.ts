import { Injectable, Logger } from '@nestjs/common';
import { EmailerService } from 'src/modules/emailer/emailer.service';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';
import { encryptData } from 'src/common/utils/encryption.util';

@Injectable()
export class EmployeesService {

    constructor(private readonly prisma: PrismaService, private readonly helper: HelperService, private readonly mail: EmailerService) { }

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
}
