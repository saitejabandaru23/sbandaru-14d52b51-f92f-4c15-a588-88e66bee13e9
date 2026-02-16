import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const url: string = req?.originalUrl || req?.url || '';

    if (
      url.startsWith('/api/auth/login') ||
      url.startsWith('/api/auth/register') ||
      url.startsWith('/api/auth') ||
      url.startsWith('/api/health')
    ) {
      return true;
    }

    return super.canActivate(context) as any;
  }
}
