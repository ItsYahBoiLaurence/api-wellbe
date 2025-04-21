import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginCreds } from 'src/types/user';
import { Public } from 'src/common/decorators/public.decorators';

@Controller('auth/sign-in')
export class AuthController {

    constructor(private readonly auth: AuthService) { }

    @Public()
    @Post()
    async signIn(@Body() credentials: LoginCreds) {
        return this.auth.signIn(credentials)
    }
}
