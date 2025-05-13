import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';

@Controller('hr-admin/employees')
export class EmployeesController {

    constructor(private readonly employeesService: EmployeesService) { }

    @Get()
    getEmployees(@CurrentUser() user_data: JwtPayload, @Query('department') department: string) {
        return this.employeesService.getAllEmployees(user_data, department)
    }

    @Post()
    inviteEmployees(@CurrentUser() user_data: JwtPayload, @Body() payload: { first_name: string, last_name: string, email: string, department: string }) {
        return this.employeesService.sendInvite(user_data, payload)
    }

}
