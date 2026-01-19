import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class InboxService {

    private console = new Logger(InboxService.name)

    constructor(private readonly prisma: PrismaService) { }

    async getInbox(email: string, cursor?: string, limit = 10) {
        const query: Parameters<typeof this.prisma.inbox.findMany>[0] = {
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
            query.cursor = { id: cursor }
        }

        const tips = await this.prisma.inbox.findMany(query)

        return {
            data: tips,
            nextCursor: tips.length === limit ? tips[tips.length - 1].id : null
        }
    }

    async getSingleMessage(tag: string, id: string) {
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

    async updateMessage(id: string) {
        if (!id) throw new BadRequestException('Invalid Id')

        const updatedMessage = await this.prisma.inbox.update({
            where: { id },
            data: { opened: true }
        })

        if (!updatedMessage) throw new ConflictException('Error updating message')

        return updatedMessage
    }
}
