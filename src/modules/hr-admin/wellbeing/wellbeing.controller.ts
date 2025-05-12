import { Controller, Get, Query } from '@nestjs/common';
import { WellbeingService } from './wellbeing.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';

@Controller('wellbeing')
export class WellbeingController {
    constructor(private readonly service: WellbeingService) { }

    @Get()
    getWellbeing(@CurrentUser() user: JwtPayload) {
        return this.service.getUserWellbeing(user)
    }

    @Get('generate')
    generateWellbeing(@CurrentUser() user: JwtPayload) {
        return this.service.generateUserWellbeing(user)
    }

    @Get('company')
    getCompanyWellbeing(@CurrentUser() user: JwtPayload, @Query('period') period: string) {
        return this.service.getCompanyWellbeing(user, period)
    }

    @Get('department')
    getDepartmentWellbeing(@CurrentUser() user: JwtPayload, @Query('period') period: string) {
        return this.service.getDepartmentWellbeing(user, period)
    }

    @Get('wellbe')
    getWellbe(@CurrentUser() user: JwtPayload, @Query('period') period: string) {
        return this.service.getComputedDomain(user, period)
    }

}
