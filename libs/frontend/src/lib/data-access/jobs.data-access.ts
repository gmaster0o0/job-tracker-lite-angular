import { Injectable, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  CreateJobDto,
  JobDto,
  JobStatusDto,
  UpdateJobStatusDto,
  ContactDto,
} from '@job-tracker-lite-angular/api-interfaces';

@Injectable({
  providedIn: 'root',
})
export class JobsDataAccessService {
  private readonly http = inject(HttpClient);
  private readonly selectedJobId = signal<number | null>(null);

  jobsResource = httpResource<JobDto[]>(() => `/api/jobs`);
  jobResource = httpResource<JobDto>(() => {
    const id = this.selectedJobId();
    return id === null ? undefined : `/api/jobs/${id}`;
  });
  jobContactsResource = httpResource<ContactDto[]>(() => {
    const id = this.selectedJobId();
    return id === null ? undefined : `/api/jobs/${id}/contacts`;
  });

  selectJob(id: number | null): void {
    this.selectedJobId.set(id);
  }

  async createJob(dto: CreateJobDto): Promise<JobDto> {
    const created = await firstValueFrom(
      this.http.post<JobDto>('/api/jobs', dto),
    );
    this.jobsResource.reload();
    this.jobResource.reload();
    return created;
  }

  async updateJobStatus(id: number, status: JobStatusDto): Promise<JobDto> {
    const dto: UpdateJobStatusDto = { status };
    const updated = await firstValueFrom(
      this.http.patch<JobDto>(`/api/jobs/${id}/status`, dto),
    );
    this.jobsResource.reload();
    this.jobResource.reload();
    return updated;
  }
}
