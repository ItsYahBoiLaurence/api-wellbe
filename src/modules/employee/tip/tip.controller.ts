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
}


