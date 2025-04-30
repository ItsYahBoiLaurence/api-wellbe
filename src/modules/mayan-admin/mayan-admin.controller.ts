import { Body, Controller, Get, Logger, Post, Query, } from '@nestjs/common';
import { MayanAdminService } from './mayan-admin.service';
import { CronService } from '../cron/cron.service';
import { EmailerService } from '../emailer/emailer.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';
import { HelperService } from '../helper/helper.service';
import { AnswerModel } from 'src/types/answer';


@Controller('mayan-admin')
export class MayanAdminController {
    constructor(
        private readonly service: MayanAdminService,
        private readonly cron: CronService,
        private readonly emailer: EmailerService,
        private readonly helper: HelperService
    ) { }

    // @Get()
    // async getProfile(@CurrentUser() user: JwtPayload) {
    //     return this.helper.getUserIdByEmail(user)
    // }

    // @Post()
    // sayHello(@Body() payload: CompanyModel) {
    //     Logger.log(payload)
    //     return this.service.createCompany(payload)
    // }

    // @Get()
    // startCronJob(@Query('company') company: string) {
    //     Logger.log(company)
    //     return this.emailer.welcomeEmail()
    // }

    @Post()
    getSettings(@CurrentUser() user: JwtPayload, @Body() data: AnswerModel[]) {
        const { company, sub } = user
        return this.helper.getAdviceForUser(data)
    }
}
