import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginCreds } from 'src/types/user';

@Controller('auth/sign-in')
export class AuthController {

    constructor(private readonly auth: AuthService) { }

    @Post()
    async signIn(@Body() credentials: LoginCreds) {
        return this.auth.signIn(credentials)
    }
}
