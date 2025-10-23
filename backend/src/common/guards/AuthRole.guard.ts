import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Role } from '../types/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class AuthRoleGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      throw new UnauthorizedException('Missing or invalid token');

    const token = authHeader.split(' ')[1];

    // 1️⃣ Verify JWT
    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });
      req.user = payload; // attach user
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // 2️⃣ Check Roles (if required)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const userRole = req.user.role?.toLowerCase();
    const hasAccess = requiredRoles.some(
      (r) => r.toLowerCase() === userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
