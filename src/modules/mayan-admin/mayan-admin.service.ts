import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyModel } from 'src/types/company';

@Injectable()
export class MayanAdminService {
    constructor(private readonly prisma: PrismaService) { }

    async createCompany(payload: CompanyModel) {
        if (!payload || !payload.name) throw new BadRequestException('Invalid Payload!')

        try {
            const newCompany = await this.prisma.company.create({
                data: {
                    name: payload.name
                }
            })
            return newCompany
        } catch (error) {
            Logger.log(error)
            throw error
        }
    }
}
