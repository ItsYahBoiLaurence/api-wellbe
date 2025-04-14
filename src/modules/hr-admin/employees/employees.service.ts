import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class EmployeesService {

    constructor(private readonly prisma: PrismaService) { }

    getAllEmployees(company: string) {
        const departments = this.prisma.department.findMany({
            where: {
                company_id: company
            },
            include: {
                employees: true
            }
        })

        if (!departments) return { message: "Company does not exist!" }

        return departments
    }
}
