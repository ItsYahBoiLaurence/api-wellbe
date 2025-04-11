import { Injectable, Logger } from '@nestjs/common';
import { Department, Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class DepartmentService {

    constructor(private readonly prisma: PrismaService) { }

    async getAllDepartment(): Promise<Department[]> {
        return this.prisma.department.findMany({
            include: {
                employees: true
            }
        })
    }

    async createDepartment(data: Prisma.DepartmentCreateInput) {
        try {
            return this.prisma.department.create({ data })
        } catch (error) {
            Logger.error(error)
        }
    }
}
