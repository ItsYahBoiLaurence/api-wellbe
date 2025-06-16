import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorators';
import { CheckInService } from './check-in.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';

@Controller('check-in')
export class CheckInController {

    constructor(private readonly service: CheckInService) { }

    @Get()
    async getCheckinStatus(@CurrentUser() user_details: JwtPayload) {
        return this.service.getUserCheckInStatus(user_details)
    }
}
