import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt-payload';

@Injectable()
export class TipService {
    constructor(private readonly prisma: PrismaService, private readonly helper: HelperService) { }

    async getTip(user_details: JwtPayload) {

        const user = await this.helper.getUserByEmail(user_details.sub)

        user.email

        const tipsBank = await this.prisma.tips.findMany({
            where: {
                user: user.email
            }
        })

        if (!tipsBank) throw new NotFoundException("Tips bank not found!")

        return tipsBank
    }
}
