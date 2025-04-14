import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserModel } from 'src/types/user';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async createEmployee(payload: UserModel) {
        try {
            if (!payload) throw new BadRequestException("Invalid Payload")

            const department = await this.prisma.department.findFirst({
                where: {
                    name: payload.department_name,
                    company: {
                        name: payload.company
                    }
                }
            })

            if (!department) throw new NotFoundException('Company does not exist!')

            const newUser = this.prisma.employee.create({
                data: {
                    email: payload.email,
                    first_name: payload.first_name,
                    last_name: payload.last_name,
                    department_id: department.id
                }
            })

            if (!newUser) throw new ConflictException('User creation failed!')

            return newUser
        } catch (error) {
            throw error
        }
    }
}
