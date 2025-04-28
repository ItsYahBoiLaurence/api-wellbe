import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
        user_data: JwtPayload,
        department: string,
    ) {

        const { company } = user_data

        const company_id = await this.helper.getCompany(company)

        if (department) {

            const department_id = await this.helper.getDepartmentId(company_id.name, department)

            const department_data = await this.prisma.department.findUnique({
                where: {
                    id: department_id
                },

                omit: {
                    created_at: true,
                    company_id: true
                },

                include: {
                    employees: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                        }
                    }
                }
            })

            Logger.log(department_data)
            return department_data
        }

        const departments = await this.prisma.department.findMany({
            where: {
                company_id: company_id.name
            },
            omit: {
                created_at: true,
                company_id: true
            },
            include: {
                employees: {
                    omit: {
                        password: true,
                        department_id: true,
                        role: true
                    }
                }
            },

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
            if (error.code === 'P2002') throw new ConflictException("Department already exist!")
            if (error.code === 'P2003') throw new NotFoundException('The specified company does not exist.');
        }
    }
}
