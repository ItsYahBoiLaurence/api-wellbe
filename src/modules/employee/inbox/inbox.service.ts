import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class InboxService {

    private console = new Logger(InboxService.name)

    constructor(private readonly prisma: PrismaService) { }

    async getInbox(email: string, cursor?: number, limit = 10) {

        this.console.log(cursor)

        const query: any = {
            where: {
                user: email
            },
            take: limit,
            orderBy: {
                created_at: 'desc'
            }
        }

        if (cursor) {
            query.skip = 1
            query.cursor = { id: Number(cursor) }
        }

        const tipCount = await this.prisma.tips.count({
            where: {
                user: email
            }
        })

        console.log(tipCount)

        const tips = await this.prisma.tips.findMany(query)

        return {
            data: tips,
            nextCursor: tips.length === limit ? tips[tips.length - 1].id : null
        }
    }
}
