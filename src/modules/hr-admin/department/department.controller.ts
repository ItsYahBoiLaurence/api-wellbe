import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { Prisma } from '@prisma/client';
import { DepartmentCreateModel } from 'src/types/department';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';

@Controller('department')
export class DepartmentController {

    constructor(private readonly departmentService: DepartmentService) { }

    @Get()
    getAllDepartment(@CurrentUser() user_data: JwtPayload, @Query('department') department: string) {
        return this.departmentService.getAllDepartment(user_data, department)
    }

    @Post()
    createDepartment(@Body() payload: DepartmentCreateModel, @CurrentUser() user_data: JwtPayload) {
        return this.departmentService.createDepartment(payload, user_data)
    }
}
