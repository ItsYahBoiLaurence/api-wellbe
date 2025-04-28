import { Controller, Get, Query } from '@nestjs/common';
import { ParticipationRateService } from './participation-rate.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';

@Controller('participation-rate')
export class ParticipationRateController {
    constructor(private readonly service: ParticipationRateService) { }


    @Get()
    getLatestBatch(@CurrentUser() user_data: JwtPayload, @Query('department') department: string) {
        return this.service.getParticipationRate(user_data, department)
    }
}
