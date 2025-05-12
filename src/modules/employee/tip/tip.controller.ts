import { Controller, Get, Query } from '@nestjs/common';
import { TipService } from './tip.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';

@Controller('tip')
export class TipController {
    constructor(private readonly service: TipService) { }

    @Get()
    getTipsBank(@CurrentUser() user: JwtPayload) {
        return this.service.getTip(user)
    }

    @Get('latest')
    getLatestTip(@CurrentUser() user: JwtPayload) {
        return this.service.latestTip(user)
    }

    @Get('holistic')
    getHolisticTip(@CurrentUser() user: JwtPayload) {
        return this.service.getHolisticTip(user)
    }

    @Get('holistic/generate')
    generateHolisticTip(@CurrentUser() user: JwtPayload) {
        return this.service.generateHolisticTip(user)
    }

    @Get('progress')
    getUserProgress(@CurrentUser() user: JwtPayload) {
        return this.service.getUserProgress(user)
    }
}
