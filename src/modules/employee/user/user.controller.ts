import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
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

    @Patch()
    updateInformation(@CurrentUser() user: JwtPayload, @Body() payload: { first_name: string, last_name: string, email: string, department: string }) {
        return this.service.updateEmployee(user, payload)
    }

    @Public()
    @Get('password-resets')
    passwordReset(@Query('email') email: string) {
        return this.helper.hashPass(email)
    }

    // @Public()
    // @Get('password-confirm')
    // passwordConfirm(@Query('pass') pass: string) {
    //     return this.helper.comparePass(pass, "$2b$10$XKx1l/.kGXr5DyvWMOjIo.7Kobse.OYmXCizBOV1DAvFiFfNyj5mm")
    // }
}
