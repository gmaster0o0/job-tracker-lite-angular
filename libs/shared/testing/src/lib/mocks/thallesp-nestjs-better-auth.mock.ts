import type { AuthSessionDto } from '@job-tracker-lite-angular/schemas';

export class AuthGuard {}

export const Public = () => {
  return (
    _target: object,
    _propertyKey?: string | symbol,
    _descriptor?: PropertyDescriptor,
  ) => {
    return undefined;
  };
};

export const Session = () => {
  return (target: object, key: string | symbol, index: number) => {
    //empty
  };
};

export type UserSession = NonNullable<AuthSessionDto>;

export default {};
