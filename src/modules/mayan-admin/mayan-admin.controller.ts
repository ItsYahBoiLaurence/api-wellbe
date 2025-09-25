import { BadRequestException, Body, Controller, Delete, Get, Logger, NotFoundException, Param, Post, Query, UploadedFile, } from '@nestjs/common';
import { MayanAdminService } from './mayan-admin.service';
import { CronService } from '../cron/cron.service';
import { EmailerService } from '../emailer/emailer.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';
import { HelperService } from '../helper/helper.service';
import { AnswerModel } from 'src/types/answer';
import { OpenaiService } from '../openai/openai.service';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from 'src/common/decorators/public.decorators';
import { CompanyData, CompanyModel } from 'src/types/company';
import { User } from 'src/types/user';
import { AuthService } from '../auth/auth.service';
import { ResendMailerService } from '../resend-mailer/resend-mailer.service';
import { EmailData } from 'src/types/resend';
import { InviteData } from 'src/types/invite';



@Controller('mayan-admin')
export class MayanAdminController {
    constructor(
        private readonly service: MayanAdminService,
        private readonly authService: AuthService,
        private readonly resendMailer: ResendMailerService
    ) { }

    @Public()
    @Get('company')
    getAllCompanies(@CurrentUser() user_details: JwtPayload) {
        return this.service.getCompanyDetails(user_details)
    }


    @Public()
    @Get('admin-users')
    getAllAdmin() {
        return this.service.getAllAdminUser()
    }

    @Public()
    @Get('company-details')
    getCompany() {
        return this.service.getCompanies()
    }

    @Public()
    @Post('create-company')
    createCompany(@Body() data: CompanyModel) {
        return this.service.createCompany(data)
    }

    @Public()
    @Get('department')
    getAllDepartmentsInCompany(@Query('company') company: string) {
        return this.service.getAllDepartments(company)
    }

    @Public()
    @Post('inviteAdmin')
    inviteAdmin(@Body() payload: {
        email: string
        first_name: string
        last_name: string
        department: string
        company: string
    }) {
        return this.service.inviteAdminUser(payload)
    }

    @Public()
    @Delete('delete-company')
    deleteCompany(@Query('companyId') companyId: string) {
        return this.service.deleteCompany(companyId)
    }


    @Get('generate-data')
    generateData(@CurrentUser() user_data: JwtPayload) {
        return this.service.generateData(user_data)
    }

    @Public()
    @Post('sa-auth')
    saLogin(@Body() payload: { email: string, password: string }) {
        return this.service.loginSuperAdmin(payload)
    }

    @Public()
    @Post('validate-token')
    validateToken(@Body() token: { access_token: string }) {
        return this.authService.validateToken(token)
    }


    @Public()
    @Post('generate-pass')
    generateHashPass(@Body() data: { password: string }) {
        return this.service.generateHashPass(data)
    }

    @Public()
    @Get("generate-new-wellbe")
    generateSingleWellbeingData() {
        return this.service.generateSingleWellbeing()
    }

    @Get("generate-company-wellbeing")
    generateCompanyWellbeingData(@CurrentUser() user_data: JwtPayload, @Query('period') period?: string) {
        return this.service.generateNewCompanyWellbeing(user_data, period)
    }
}
