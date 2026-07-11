import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountStatus } from '@prisma/client';
import { ALLOW_PENDING_KEY } from '../decorators';

@Injectable()
export class ActiveAccountGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowPending = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PENDING_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (allowPending) return true;

    const request = context.switchToHttp().getRequest();
    const session = request.session;

    // no session -> either there's no AuthGuard on this route, or it's an anonymous route -> allow
    if (!session?.user) return true;

    if (session.user.status === AccountStatus.PENDING_DELETION) {
      throw new ForbiddenException('Account is pending deletion');
    }

    return true;
  }
}
