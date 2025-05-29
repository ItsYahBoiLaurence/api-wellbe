import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';
import { InboxService } from './inbox.service';

@Controller('inbox')
export class InboxController {

    constructor(private readonly service: InboxService) { }

    @Get()
    getInbox(@CurrentUser() user_info: JwtPayload, @Query('cursor') cursor: number) {
        return this.service.getInbox(user_info.sub, cursor)
    }

}
