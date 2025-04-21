import { Body, Controller, Get, Logger, Post, Request } from '@nestjs/common';
import { MayanAdminService } from './mayan-admin.service';
import { CompanyModel } from 'src/types/company';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';


@Controller('mayan-admin')
export class MayanAdminController {
    constructor(private readonly service: MayanAdminService
    ) { }

    @Get()
    async getProfile(@CurrentUser() user: JwtPayload) {
        return user
    }

    @Post()
    sayHello(@Body() payload: CompanyModel) {
        Logger.log(payload)
        return this.service.createCompany(payload)
    }
}
