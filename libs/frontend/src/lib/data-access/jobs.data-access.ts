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
} from '@job-tracker-lite-angular/schemas';

@Injectable({
  providedIn: 'root',
})
export class JobsDataAccessService {
  private readonly http = inject(HttpClient);
  private readonly selectedJobId = signal<string | null>(null);

  createJobTrigger = signal<CreateJobDto | null>(null);

  jobsResource = httpResource<JobDto[]>(() => `/api/jobs`);

  jobResource = httpResource<JobDto>(() => {
    const id = this.selectedJobId();
    return id === null ? undefined : `/api/jobs/${id}`;
  });

  createJobResource = httpResource<JobDto>(() => {
    const dto = this.createJobTrigger();
    if (!dto) return undefined;
    return {
      url: `/api/jobs`,
      method: 'POST',
      body: dto,
    };
  });

  selectJob(id: string | null): void {
    this.selectedJobId.set(id);
  }

  createJob(dto: CreateJobDto): void {
    this.createJobTrigger.set(dto);
  }

  resetCreateJob(): void {
    this.createJobTrigger.set(null);
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
