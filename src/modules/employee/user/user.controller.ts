import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserModel, UserQuery } from 'src/types/user';
import { HelperService } from 'src/modules/helper/helper.service';
import { Public } from 'src/common/decorators/public.decorators';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/jwt-payload';

@Controller('user')
export class UserController {
    constructor(
        private readonly service: UserService,
        private readonly helper: HelperService
    ) { }

    @Get()
    getUser(@CurrentUser() user_data: JwtPayload) {
        return this.helper.getUserIdByEmail(user_data)
    }

    @Public()
    @Post()
    registerUser(@Body() payload: UserModel) {
        return this.service.createEmployee(payload)
    }
}
