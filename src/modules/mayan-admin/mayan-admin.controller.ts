import { Body, Controller, Get, Logger, Param, Post, Query, Request } from '@nestjs/common';
import { MayanAdminService } from './mayan-admin.service';
import { CompanyModel } from 'src/types/company';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';
import { CronService } from '../cron/cron.service';


@Controller('mayan-admin')
export class MayanAdminController {
    constructor(
        private readonly service: MayanAdminService,
        private readonly cron: CronService
    ) { }

    // @Get()
    // async getProfile(@CurrentUser() user: JwtPayload) {
    //     return user
    // }

    // @Post()
    // sayHello(@Body() payload: CompanyModel) {
    //     Logger.log(payload)
    //     return this.service.createCompany(payload)
    // }

    @Get()
    startCronJob(@Query('company') company: string) {
        return this.cron.addCronJob(company)
    }
}
