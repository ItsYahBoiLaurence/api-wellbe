import { Body, Controller, Get, Post, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { CsvParcerService } from 'src/modules/csv-parcer/csv-parcer.service';
import { ResendMailerService } from 'src/modules/resend-mailer/resend-mailer.service';
import { InviteData } from 'src/types/invite';

@Controller('hr-admin/employees')
export class EmployeesController {

    constructor(
        private readonly employeesService: EmployeesService,
        private readonly parser: CsvParcerService,
        private readonly resendMailer: ResendMailerService
    ) { }

    @Get()
    getEmployees(@CurrentUser() user_data: JwtPayload, @Query('department') department: string) {
        return this.employeesService.getAllEmployees(user_data, department)
    }

    @Post()
    inviteEmployees(@CurrentUser() user_data: JwtPayload, @Body() payload: InviteData) {
        return this.resendMailer.sendSingleInvite(user_data, payload)
    }

    @Post('upload-csv')
    @UseInterceptors(FileInterceptor('file'))
    batchUpload(@CurrentUser() user_details: JwtPayload, @UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException("Missing File!")
        return this.resendMailer.sendBulkEmail(user_details, file.buffer)
    }
} 
