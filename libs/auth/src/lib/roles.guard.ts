import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, type JwtPayload } from '@bankcore/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user context available');
    }

    const userRoles = new Set<string>();

    if (user.roles) {
      for (const role of user.roles) {
        userRoles.add(role.toUpperCase());
      }
    }

    if (user.realm_access?.roles) {
      for (const role of user.realm_access.roles) {
        userRoles.add(role);
      }
    }

    if (user.resource_access) {
      for (const resource of Object.values(user.resource_access)) {
        for (const role of resource.roles) {
          userRoles.add(role);
        }
      }
    }

    const hasRole = requiredRoles.some((role) => userRoles.has(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
