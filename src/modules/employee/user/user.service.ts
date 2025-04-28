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

        const { email, first_name, last_name, password, company, department_name } = payload

        const hashed_pass = await this.helper.hashPass(password)

        const company_name = await this.helper.getCompany(company)

        const department_id = await this.helper.getDepartmentId(company_name.name, department_name)

        try {
            const newUser = await this.prisma.employee.create({
                data: {
                    email,
                    first_name,
                    last_name,
                    department_id,
                    password: hashed_pass
                },
            })
            if (!newUser) throw new ConflictException("Error creating new user!")

            const resPayload = {
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name
            }

            return resPayload
        } catch (error) {
            if (error.code === 'P2002') throw new ConflictException("User already exist!")
            if (error.code === 'P2003') throw new NotFoundException('The specified company does not exist.');
        }
    }
}
