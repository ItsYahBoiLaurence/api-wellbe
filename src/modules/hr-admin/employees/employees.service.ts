import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';

@Injectable()
export class EmployeesService {

    constructor(private readonly prisma: PrismaService) { }

    getAllEmployees(user_data: JwtPayload) {

        const { company } = user_data
        const departments = this.prisma.department.findMany({
            where: {
                company_id: company
            },
            include: {
                employees: {
                    omit: {
                        password: true,
                        department_id: true,
                        role: true
                    }
                }
            }
        })

        if (!departments) return { message: "Company does not exist!" }

        return departments
    }
}
