import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { AccountStatus } from '@prisma/client';
import { ActiveAccountGuard } from './active-account.guard';
import { authSessionFixtures } from '@job-tracker-lite-angular/testing';
import { createMockContext } from '@job-tracker-lite-angular/testing';

describe('ActiveAccountGuard', () => {
  let guard: ActiveAccountGuard;
  let reflector: Reflector;

  beforeEach(() => {
    // Mivel NestJS környezetben vagyunk Jest-tel, a gyári Reflectort használjuk
    reflector = new Reflector();
    guard = new ActiveAccountGuard(reflector);
  });

  it('allow, when no session (anonymous route)', () => {
    const context = createMockContext({
      session: authSessionFixtures.guest,
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allow, when ACTIVE user', () => {
    const context = createMockContext({
      session: authSessionFixtures.authenticated,
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('deny, when PENDING_DELETION user', () => {
    const context = createMockContext({
      session: authSessionFixtures.pendingDeletion,
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allow, when PENDING_DELETION user and @AllowPending is on the route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = createMockContext({
      session: authSessionFixtures.pendingDeletion,
    });
    expect(guard.canActivate(context)).toBe(true);
  });
});
