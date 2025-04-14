import { Body, Controller, Get, Post } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { Prisma } from '@prisma/client';
import { DepartmentCreateModel } from 'src/types/department';

@Controller('department')
export class DepartmentController {

    constructor(private readonly departmentService: DepartmentService) { }

    @Get()
    getAllDepartment() {
        return this.departmentService.getAllDepartment()
    }

    @Post()
    createDepartment(@Body() payload: DepartmentCreateModel) {
        return this.departmentService.createDepartment(payload)
    }
}
