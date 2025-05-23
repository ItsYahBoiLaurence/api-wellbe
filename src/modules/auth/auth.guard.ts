import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler())
    if (isPublic) return true

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request)
    if (!token) throw new UnauthorizedException()

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET')
        }
      )
      request['user'] = payload
    } catch (error) {
      throw new UnauthorizedException("here")
    }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (!request.headers['authorization']) throw new UnauthorizedException("Invalid Authorization Header!")
    const [type, token] = request.headers['authorization'].split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
