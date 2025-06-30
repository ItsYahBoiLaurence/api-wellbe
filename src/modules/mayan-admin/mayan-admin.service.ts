import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyData, CompanyModel } from 'src/types/company';
import { UserService } from '../user/user.service';
import { HelperService } from '../helper/helper.service';
import { JwtPayload } from 'src/types/jwt-payload';
import { User } from 'src/types/user';
import { ConfigService } from '@nestjs/config';
import { EmailerService } from '../emailer/emailer.service';

@Injectable()
export class MayanAdminService {

    private logger = new Logger(MayanAdminService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly helper: HelperService,
        private readonly config: ConfigService,
        private readonly mail: EmailerService
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

    async createCompany(data: CompanyModel) {
        try {
            const newCompany = await this.prisma.company.create({
                data: {
                    name: data.company,
                    departments: {
                        create: {
                            name: "Human Resources"
                        }
                    },
                    Settings: {
                        create: {}
                    }
                },
            })
            if (!newCompany) throw new ConflictException("Error Creating new Company")
            return newCompany
        } catch (error) {
            if (error.code === 'P2002') throw new ConflictException("Company Already Exist")
        }
    }

    async getAllDepartments(company: string) {
        const departments = await this.prisma.department.findMany({
            where: {
                company_id: company
            },
            select: {
                name: true
            }
        })
        if (!departments) return []

        return departments.map((department) => department.name)
    }

    async deleteCompany(id: string) {
        try {
            await this.prisma.company.delete({
                where: {
                    id
                }
            })
            return { message: "Company Deleted Successfully!" }
        } catch (error) {
            this.logger.log(error)
        }
    }

    async inviteAdminUser(data: User) {
        const domain_link = this.config.get<string>("INVITE_LINK")
        try {
            const link = `${domain_link}/sign-up?email=${data.email}&firstname=${data.first_name}&lastname=${data.last_name}&department=${data.department_name}&company=${data.company}&role=admin`
            this.mail.inviteEmployee(data.first_name, data.email, data.company, link)
            return { message: "Invite Sent" }
        } catch (e) {
            throw new e
        }
    }


    // async generateCUIDData() {
    //     return this.helper.generateCUID()
    // }
}
