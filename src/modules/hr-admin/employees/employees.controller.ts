import { Body, Controller, Get, Post, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { CsvParcerService } from 'src/modules/csv-parcer/csv-parcer.service';

@Controller('hr-admin/employees')
export class EmployeesController {

    constructor(private readonly employeesService: EmployeesService, private readonly parser: CsvParcerService) { }

    @Get()
    getEmployees(@CurrentUser() user_data: JwtPayload, @Query('department') department: string) {
        return this.employeesService.getAllEmployees(user_data, department)
    }

    @Post()
    inviteEmployees(@CurrentUser() user_data: JwtPayload, @Body() payload: { first_name: string, last_name: string, email: string, department: string }) {
        return this.employeesService.sendInvite(user_data, payload)
    }

    @Post('upload-csv')
    @UseInterceptors(FileInterceptor('file'))
    batchUpload(@CurrentUser() user_details: JwtPayload, @UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException("Missing File!")
        return this.employeesService.sendBulkInvite(user_details, file.buffer)
    }
} 
