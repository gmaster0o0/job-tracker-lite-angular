import { Injectable, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  CreateJobDto,
  JobDto,
  JobStatusDto,
  UpdateJobDto,
  UpdateJobStatusDto,
} from '@job-tracker-lite-angular/api-interfaces';

@Injectable({
  providedIn: 'root',
})
export class JobsDataAccessService {
  private readonly http = inject(HttpClient);
  private readonly selectedJobId = signal<string | null>(null);

  jobsResource = httpResource<JobDto[]>(() => `/api/jobs`);

  jobResource = httpResource<JobDto>(() => {
    const id = this.selectedJobId();
    return id === null ? undefined : `/api/jobs/${id}`;
  });

  selectJob(id: string | null): void {
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

  async updateJobStatus(id: string, status: JobStatusDto): Promise<JobDto> {
    const dto: UpdateJobStatusDto = { status };
    const updated = await firstValueFrom(
      this.http.patch<JobDto>(`/api/jobs/${id}/status`, dto),
    );
    this.jobsResource.reload();
    this.jobResource.reload();
    return updated;
  }

  async updateJob(id: string, dto: UpdateJobDto): Promise<JobDto> {
    const updated = await firstValueFrom(
      this.http.patch<JobDto>(`/api/jobs/${id}`, dto),
    );
    this.jobsResource.reload();
    this.jobResource.reload();
    return updated;
  }

  async deleteJob(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`/api/jobs/${id}`));
    this.jobsResource.reload();
  }
}
