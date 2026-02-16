import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header = req.headers?.authorization as string | undefined;

    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }

    const token = header.slice('Bearer '.length).trim();

    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get<string>('JWT_SECRET') || 'dev_secret',
      });

      req.user = payload; // <- this is what CurrentUser reads
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
