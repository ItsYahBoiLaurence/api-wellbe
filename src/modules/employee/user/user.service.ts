import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailerService } from 'src/modules/emailer/emailer.service';
import { HelperService } from 'src/modules/helper/helper.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ResendMailerService } from 'src/modules/resend-mailer/resend-mailer.service';
import { ResendEmail } from 'src/types/email';
import { JwtPayload } from 'src/types/jwt-payload';
import { UserModel, UserWithRole } from 'src/types/user';

@Injectable()
export class UserService {
    private console = new Logger(UserService.name)
    constructor(
        private readonly prisma: PrismaService,
        private readonly helper: HelperService,
        private readonly emailer: EmailerService,
        private readonly config: ConfigService,
        private readonly resend: ResendMailerService
    ) { }

    async createEmployee(payload: UserWithRole) {
        if (!payload) throw new BadRequestException("Invalid Payload")
        const { email, first_name, last_name, password, company, department_name } = payload

        const hashed_pass = await this.helper.hashPass(password)

        const company_name = await this.helper.getCompany(company)

        const department_id = await this.helper.getDepartmentId(company_name.name, department_name)

        this.console.log(payload.role)

        try {
            const newUser = await this.prisma.employee.create({
                data: {
                    email,
                    first_name,
                    last_name,
                    department_id,
                    password: hashed_pass,
                    role: payload.role ?? undefined
                },
            })
            if (!newUser) throw new ConflictException("Error creating new user!")

            const resPayload = {
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name
            }
            return resPayload
        } catch (error) {
            Logger.log(error)
            if (error.code === 'P2002') throw new ConflictException("User already exist!")
            if (error.code === 'P2003') throw new NotFoundException('The specified company does not exist.');
        }
    }

    async updateEmployee(user_details: JwtPayload, payload: { first_name: string, last_name: string, email: string, department: string }) {

        const { company } = user_details

        this.console.log(payload)

        const department = await this.helper.getDepartment(company, payload.department)

        const newInfo = await this.prisma.employee.update({
            where: {
                email: payload.email
            },
            data: {
                first_name: payload.first_name,
                last_name: payload.last_name,
                department_id: department.id,
            }
        })

        const participation_rate = await this.prisma.employee_Under_Batch.updateMany({
            where: {
                email: payload.email
            },
            data: {
                department_id: department.id
            }
        })

        if (!newInfo) throw new ConflictException("Update error")

        return newInfo
    }

    async passwordReset(email: string) {
        const user = await this.helper.getUserByEmail(email)
        const baseUrl = this.config.get<string>("INVITE_LINK")
        const link = `${baseUrl}/change-password?data=${btoa(user.email)}`
        this.console.log(email, link)


        const from = this.config.get<string>("RESEND_FROM_EMAIL")
        if (!from) throw new ConflictException("From email not set!")

        const emailOption: ResendEmail = {
            to: user.email,
            subject: "Password Change Request",
            from,
            html: this.helper.getForgotPassword(user.first_name, link),
        }
        try {
            const { error } = await this.resend.sendEmail(emailOption)
            if (error) throw new ConflictException(error)
            return { success: true, message: "Password change request email sent!" }
        } catch (e) {
            this.console.log(e)
            throw new ConflictException(e)
        }
    }

    async passwordChange(payload: { email: string, password: string }) {
        if (!payload.password || payload.password == undefined || !payload.email || payload.email == undefined) throw new BadRequestException
        Logger.log(`${payload.email} ${payload.password}`)
        const user = await this.helper.getUserByEmail(payload.email)
        const update = await this.prisma.employee.update({
            where: {
                id: user.id,
            },
            data: {
                password: await this.helper.hashPass(payload.password)
            }
        })
        if (!update) throw new ConflictException("Error Changing Password")
        return { message: "Password changed successfully!" }
    }
}
