import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AccountStatus } from '@prisma/client';
import { ActiveAccountGuard } from './active-account.guard';

describe('ActiveAccountGuard', () => {
  let guard: ActiveAccountGuard;
  let reflector: Reflector;

  const createMockContext = (session?: {
    user?: { id: string; status: AccountStatus };
  }): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ session }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new ActiveAccountGuard(reflector);
  });

  it('allow, when no session (anonymous route)', () => {
    const context = createMockContext(undefined);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allow, when ACTIVE user', () => {
    const context = createMockContext({
      user: { id: '1', status: AccountStatus.ACTIVE },
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('deny, when PENDING_DELETION user', () => {
    const context = createMockContext({
      user: { id: '1', status: AccountStatus.PENDING_DELETION },
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allow, when PENDING_DELETION user and @AllowPending is on the route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const context = createMockContext({
      user: { id: '1', status: AccountStatus.PENDING_DELETION },
    });
    expect(guard.canActivate(context)).toBe(true);
  });
});
