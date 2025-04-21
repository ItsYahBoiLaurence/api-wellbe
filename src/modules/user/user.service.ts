import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HelperService } from '../helper/helper.service';

@Injectable()
export class UserService {

    constructor(private readonly prisma: PrismaService, private readonly helper: HelperService) { }

    async findUser(email: string) {
        if (!email) throw new BadRequestException("Invalid Payload")

        const user = await this.prisma.employee.findUnique({
            where: {
                email,
            }, include: {
                department: true
            }
        })

        if (!user) throw new NotFoundException("User not Found!")

        return user
    }
}
