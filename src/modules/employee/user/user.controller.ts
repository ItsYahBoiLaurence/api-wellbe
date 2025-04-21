import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserModel, UserQuery } from 'src/types/user';
import { HelperService } from 'src/modules/helper/helper.service';
import { Public } from 'src/common/decorators/public.decorators';

@Controller('user')
export class UserController {
    constructor(
        private readonly service: UserService,
        private readonly helper: HelperService
    ) { }

    @Get()
    getUser(@Query() query: UserQuery) {
        return this.helper.getUserIdByEmail(query)
    }

    @Public()
    @Post()
    registerUser(@Body() payload: UserModel) {
        return this.service.createEmployee(payload)
    }
}
