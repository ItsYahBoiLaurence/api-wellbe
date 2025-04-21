import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Department, Prisma } from '@prisma/client';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { DepartmentCreateModel } from 'src/types/department';
import { JwtPayload } from 'src/types/jwt-payload';

@Injectable()
export class DepartmentService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly helper: HelperService
    ) { }

    async getAllDepartment(
        user_data: JwtPayload
    ): Promise<Department[]> {

        const { company } = user_data

        const company_id = await this.helper.getCompany(company)

        const departments = await this.prisma.department.findMany({
            where: {
                company_id: company_id.name
            },
            include: {
                employees: {
                    omit: {
                        password: true,
                        department_id: true
                    }
                }
            }
        })

        return departments
    }

    async createDepartment(payload: DepartmentCreateModel, user_data: JwtPayload) {

        const { company, role } = user_data

        if (role === 'employee') throw new ForbiddenException()

        if (!payload || !payload.name) throw new BadRequestException('Invalid Payload!')

        try {
            const newDepartment = await this.prisma.department.create({
                data: {
                    name: payload.name,
                    company_id: company
                }
            })
            return newDepartment
        } catch (error) {
            if (error.code === 'P2003') throw new NotFoundException('The specified company does not exist.');
        }
    }
}
