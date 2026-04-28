export function apiInterfaces(): string {
  return 'api-interfaces';
}

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};
