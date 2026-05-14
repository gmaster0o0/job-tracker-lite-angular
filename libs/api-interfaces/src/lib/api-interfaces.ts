export function apiInterfaces(): string {
  return 'api-interfaces';
}

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export interface HealthIndicator {
  status: 'up' | 'down';
  uptime?: string;
  timestamp?: string;
}

export interface HealthResponseDto {
  status: 'ok' | 'error';
  info: {
    server?: HealthIndicator;
    database?: HealthIndicator;
  };
  error: {
    server?: HealthIndicator;
    database?: HealthIndicator;
  };
  details: {
    server?: HealthIndicator;
    database?: HealthIndicator;
  };
}

export type JobStatusDto =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'job offered'
  | 'rejected';

export interface JobDto {
  id: string;
  position: string;
  link?: string;
  description?: string;
  company: string;
  status: JobStatusDto;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobDto {
  position: string;
  link?: string;
  company: string;
  description?: string;
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

export interface ContactDto {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactDto {
  name: string;
  email?: string;
  phoneNumber?: string;
}

export interface UpdateContactDto {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface NoteDto {
  id: string;
  jobId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  body: string;
}

export interface UpdateNoteDto {
  title?: string;
  body?: string;
}
