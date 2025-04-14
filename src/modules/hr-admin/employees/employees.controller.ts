import { Controller, Get, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';

@Controller('hr-admin/employees')
export class EmployeesController {

    constructor(private readonly employeesService: EmployeesService) { }

    @Get()
    getEmployees(@Query('company') company: string) {
        return this.employeesService.getAllEmployees(company)
    }


}
