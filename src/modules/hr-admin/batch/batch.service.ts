import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class BatchService {
    constructor(private readonly prisma: PrismaService) { }

    async startBatch(company: string) {
        if (!company) throw new BadRequestException("Invalid Data!")

        const company_exist = await this.prisma.company.findUnique({
            where: {
                name: company
            }
        })

        if (!company_exist) throw new NotFoundException(`${company} doesn't exist!`)

    }
}
