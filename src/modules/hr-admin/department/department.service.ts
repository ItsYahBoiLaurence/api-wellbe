import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Department, Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { DepartmentCreateModel } from 'src/types/department';

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

    async createDepartment(payload: DepartmentCreateModel) {

        if (!payload || !payload.name || !payload.company) throw new BadRequestException('Invalid Payload!')

        const companyExist = this.prisma.company.findUnique({
            where: {
                name: payload.company
            }
        })
        if (!companyExist) throw new NotFoundException(`${payload.company} does not exist!`)
        try {
            const newDepartment = await this.prisma.department.create({
                data: {
                    name: payload.name,
                    company_id: payload.company
                }
            })
            return newDepartment
        } catch (error) {
            if (error.code === 'P2003') throw new NotFoundException('The specified company does not exist.');
        }
    }
}
