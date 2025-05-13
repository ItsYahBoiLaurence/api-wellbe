import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';
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

    async updateEmployee(user_details: JwtPayload, payload: { first_name: string, last_name: string, email: string, department: string }) {

        const { company } = user_details

        Logger.log(payload)

        const department = await this.helper.getDepartment(company, payload.department)

        console.log(department)

        const newInfo = await this.prisma.employee.update({
            where: {
                email: payload.email
            },
            data: {
                first_name: payload.first_name,
                last_name: payload.last_name,
                department_id: department.id,
            }
        })

        const participation_rate = await this.prisma.employee_Under_Batch.updateMany({
            where: {
                email: payload.email
            },
            data: {
                department_id: department.id
            }
        })

        if (!newInfo) throw new ConflictException("Update error")

        return newInfo
    }
}
