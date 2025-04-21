import { Body, Controller, Logger, Post } from '@nestjs/common';
import { MayanAdminService } from './mayan-admin.service';
import { CompanyModel } from 'src/types/company';

@Controller('mayan-admin')
export class MayanAdminController {
    constructor(private readonly service: MayanAdminService
    ) { }

    @Post()
    sayHello(@Body() payload: CompanyModel) {
        Logger.log(payload)
        return this.service.createCompany(payload)
    }
}
