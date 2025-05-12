import { Injectable } from '@nestjs/common';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';

@Injectable()
export class EmployeesService {

    constructor(private readonly prisma: PrismaService, private readonly helper: HelperService) { }

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
}
