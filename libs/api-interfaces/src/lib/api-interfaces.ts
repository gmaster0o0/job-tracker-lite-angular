export function apiInterfaces(): string {
  return 'api-interfaces';
}

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export interface HealthResponseDto {
  status: 'UP' | 'DOWN';
  database: 'UP' | 'DOWN';
  timestamp: string;
}
