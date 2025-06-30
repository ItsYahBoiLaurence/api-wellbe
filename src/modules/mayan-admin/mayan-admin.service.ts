import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyData, CompanyModel } from 'src/types/company';
import { UserService } from '../user/user.service';
import { HelperService } from '../helper/helper.service';
import { JwtPayload } from 'src/types/jwt-payload';

@Injectable()
export class MayanAdminService {

    private logger = new Logger(MayanAdminService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly helper: HelperService,
    ) { }

    async getCompanyDetails(user_details: JwtPayload): Promise<CompanyData[]> {
        const companies = await this.prisma.company.findMany({
            include: {
                departments: {
                    include: {
                        _count: {
                            select: { employees: true },
                        },
                    },
                },
            },
        });

        return companies.map((company) => {
            const totalEmployees = company.departments.reduce(
                (sum, dept) => sum + dept._count.employees,
                0
            );

            return {
                name: company.name,
                date_created: company.created_at,
                employee_count: totalEmployees,
            };
        });
    }

    async getAllAdminUser() {

        const adminUsers = await this.prisma.employee.findMany({
            where: {
                role: "admin"
            },
            include: {
                department: {
                    select: {
                        company_id: true
                    }
                }
            },
            omit: {
                password: true,
                role: true,
                department_id: true
            },
        })

        if (!adminUsers) return []

        return adminUsers
    }

    async getCompanies() {
        const company_details = await this.prisma.company.findMany({
            select: {
                name: true,
                departments: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!company_details) return new ConflictException("No Company Details")

        return company_details
    }

    async createCompany() {

        const newCompany = await this.prisma.company.create({
            data: {
                name: "Laurence Inc.",
                // departments: {
                //     create: {
                //         name: "Human Resources"
                //     }
                // },
                // Settings: {
                //     create: {}
                // }
            },
            // include: {
            //     departments: true
            // }
        })
        if (!newCompany) throw new ConflictException("Error Creating new Company")
        return newCompany
    }
}
