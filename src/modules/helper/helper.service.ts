import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HelperService {
    constructor(private readonly prisma: PrismaService) { }

    async getCompany(company_name: string) {
        const company = await this.prisma.company.findUnique({
            where: {
                name: company_name
            }
        })

        if (!company) throw new NotFoundException("Company doesn't exist")

        return company.name
    }

    async getDepartmentId(company_name: string, department_name: string) {
        const department = await this.prisma.department.findUnique({
            where: {
                name_company_id: {
                    name: department_name,
                    company_id: company_name,
                },
            },
        })

        if (!department) throw new NotFoundException("Department doesn't exist")

        return department.id
    }
}
