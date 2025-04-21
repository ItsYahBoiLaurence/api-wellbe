import { Controller, Get, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';

@Controller('hr-admin/employees')
export class EmployeesController {

    constructor(private readonly employeesService: EmployeesService) { }

    @Get()
    getEmployees(@CurrentUser() user_data: JwtPayload) {
        return this.employeesService.getAllEmployees(user_data)
    }
}
