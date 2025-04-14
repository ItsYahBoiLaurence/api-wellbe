import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserModel } from 'src/types/user';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async createEmployee(payload: UserModel) {
        if (!payload) throw new BadRequestException("Invalid Payload")

        const company = await this.prisma.company.findUnique({
            where: {
                name: payload.company,
            },
        })

        if (!company) throw new NotFoundException('Company does not exist!')

        const department = await this.prisma.department.findUnique({
            where: {
                name_company_id: {
                    name: payload.department_name,
                    company_id: company.name,
                },
            },
        })

        if (!department) throw new NotFoundException('Department does not exist!')

        const newUser = await this.prisma.employee.create({
            data: {
                email: payload.email,
                first_name: payload.first_name,
                last_name: payload.last_name,
                department_id: department.id,
            },
        })
        return newUser
    }
}
