import { Body, ConflictException, Controller, Get, Logger, Post } from '@nestjs/common';
import { MayanAdminService } from './mayan-admin.service';
import { CompanyModel } from 'src/types/company';
import { HelperService } from '../helper/helper.service';

@Controller('mayan-admin')
export class MayanAdminController {
    constructor(private readonly service: MayanAdminService, private readonly helper: HelperService) { }

    @Post()
    sayHello(@Body() payload: CompanyModel) {
        Logger.log(payload)
        return this.service.createCompany(payload)
    }

    @Get()
    async testing() {
        const batch_record = await this.helper.isReadyToReleaseNewBatch("Mayan Solutions Inc")

        return batch_record
    }
}
