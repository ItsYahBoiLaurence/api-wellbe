import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginCreds, UserModel } from 'src/types/user';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { HelperService } from '../helper/helper.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly helper: HelperService
    ) { }

    async signIn(credential: LoginCreds) {
        if (!credential) throw new BadRequestException("Invalid Credentials!")

        const { email, password } = credential

        const user = await this.userService.findUser(email.toLowerCase())

        if (!user) throw new UnauthorizedException("Invalid Credentials!")

        const isPassMatch = await this.helper.comparePass(password, user.password)

        if (isPassMatch !== true) throw new UnauthorizedException("Incorrect Username or Password!")

        const payload = {
            sub: user.email,
            company: user.department.company_id,
            role: user.role
        }
        return { access_token: await this.jwtService.signAsync(payload) }
    }

    async registerUser(payload: UserModel) {
        if (!payload) throw new BadRequestException("Invalid Payload")

        const {
            email,
            first_name,
            last_name,
            department_name,
            company,
            password } = payload

        if (!email || !first_name || !last_name || !department_name || !company || !password) throw new BadRequestException("Invalid Payload")

        const department_id = await this.helper.getDepartmentId(company, department_name)

        const hashed_pass = await this.helper.hashPass(password)

        const user = await this.prisma.employee.create({
            data: {
                email: email.toLowerCase(),
                first_name: first_name,
                last_name: last_name,
                department_id,
                password: hashed_pass
            }
        })

        if (!user) throw new ConflictException("Registration Error!")

        return user
    }

    async signCreds(creds: { email: string, role: string, company: string }) {
        const payload = {
            sub: creds.email,
            company: creds.company,
            role: creds.role
        }

        const access_token = await this.jwtService.signAsync(payload)

        return { access_token }
    }

    async validateToken(token: { access_token: string }) {
        try {
            await this.jwtService.verifyAsync(token.access_token)
            return { success: true, message: "Token is valid!" }
        } catch (error) {
            if (error.name == 'TokenExpiredError') return { success: false, message: "Expired Token" }
            else return { success: false, message: "Invalid token" }
        }
    }
}
