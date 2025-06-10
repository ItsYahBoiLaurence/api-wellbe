import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TipController } from '../tip/tip.controller';
import { BadRequestError } from 'openai';

@Injectable()
export class InboxService {

    private console = new Logger(InboxService.name)

    constructor(private readonly prisma: PrismaService) { }

    async getInbox(email: string, cursor?: number, limit = 10) {

        const query: any = {
            where: {
                receiver: email
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

        const [tips, tipCount] = await Promise.all([
            await this.prisma.inbox.findMany(query),
            await this.prisma.inbox.count({
                where: query.where
            })
        ])

        return {
            data: tips,
            nextCursor: tipCount === limit ? tips[tipCount].id : null
        }
    }

    async getSingleMessage(tag: string, id: number) {
        if (!tag || !id) throw new BadRequestException('Invalid message id and tag!')

        const single = await this.prisma.inbox.findFirst({
            where: {
                tag,
                id
            }
        })

        if (!single) throw new NotFoundException("Message not Found!")
        return single
    }

    async updateMessage(id: number) {
        if (!id) throw new BadRequestException('Invalid Id')

        const updatedMessage = await this.prisma.inbox.update({
            where: { id },
            data: { opened: true }
        })

        if (!updatedMessage) throw new ConflictException('Error updating message')

        return updatedMessage
    }
}
