import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserModel } from 'src/types/user';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async createEmployee(payload: UserModel) {
        if (!payload) throw new BadRequestException("Invalid Payload")

        const company = await this.prisma.department.findFirst({
            where: {
                name: payload.department_name,
                company: {
                    name: payload.company
                }
            }
        })
    }
}
