import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserModel } from 'src/types/user';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly helper: HelperService
    ) { }

    async createEmployee(payload: UserModel) {
        if (!payload) throw new BadRequestException("Invalid Payload")

        const company = await this.helper.getCompany(payload.company)

        const department_id = await this.helper.getDepartmentId(company, payload.department_name)

        const newUser = await this.prisma.employee.create({
            data: {
                email: payload.email,
                first_name: payload.first_name,
                last_name: payload.last_name,
                department_id: department_id,
            },
        })

        return newUser
    }
}
