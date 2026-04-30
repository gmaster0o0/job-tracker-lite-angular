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

export type JobStatusDto =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'job offered'
  | 'rejected';

export interface JobDto {
  id: number;
  position: string;
  link: string;
  description: string;
  company: string;
  status: JobStatusDto;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobDto {
  position: string;
  link: string;
  description: string;
  company: string;
}

export interface UpdateJobDto {
  position?: string;
  link?: string;
  description?: string;
  company?: string;
  status?: JobStatusDto;
}

export interface UpdateJobStatusDto {
  status: JobStatusDto;
}
