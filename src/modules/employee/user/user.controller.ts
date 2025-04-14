import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserModel } from 'src/types/user';

@Controller('user')
export class UserController {
    constructor(private readonly service: UserService) { }

    @Post()
    registerUser(@Body() payload: UserModel) {
        return this.service.createEmployee(payload)
    }
}
