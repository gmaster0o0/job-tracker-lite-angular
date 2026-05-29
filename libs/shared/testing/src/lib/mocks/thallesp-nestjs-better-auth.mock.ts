import type { AuthSessionDto } from '@job-tracker-lite-angular/schemas';

export class AuthGuard {}

export function Session(): ParameterDecorator {
  return () => undefined;
}

export type UserSession = NonNullable<AuthSessionDto>;

export default {};
