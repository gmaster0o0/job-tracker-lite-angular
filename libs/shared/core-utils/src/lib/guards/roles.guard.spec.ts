import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  function buildContext(session: unknown): ExecutionContext {
    const request = { session };
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as unknown as ExecutionContext;
  }

  it('should return true when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = buildContext({ user: { id: 'u1', role: Role.USER } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true when required roles array is empty', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const context = buildContext({ user: { id: 'u1', role: Role.USER } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when session is missing', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = buildContext(null);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user is not in session', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = buildContext({});

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user role is insufficient', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = buildContext({ user: { id: 'u1', role: Role.USER } });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Insufficient permissions'),
    );
  });

  it('should return true when user has the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = buildContext({ user: { id: 'u1', role: Role.ADMIN } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true when user has one of multiple required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.MODERATOR, Role.ADMIN]);
    const context = buildContext({ user: { id: 'u1', role: Role.MODERATOR } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should default to USER role when role is not set on session user', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.USER]);
    const context = buildContext({ user: { id: 'u1' } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when defaulted USER role is insufficient', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = buildContext({ user: { id: 'u1' } });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
