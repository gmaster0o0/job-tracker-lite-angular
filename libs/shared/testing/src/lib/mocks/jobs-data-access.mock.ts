import {
  ContactDto,
  CreateJobDto,
  JobDto,
  JobStatusDto,
  UpdateJobDto,
} from '@job-tracker-lite-angular/api-interfaces';
import { jobFixtures } from '../fixtures/jobs.fixtures';
import { ResourceState } from './ResourceState';

export type JobsDataAccessMockOptions = {
  jobs?: JobDto[];
  jobsError?: unknown;
  detail?: JobDto;
  detailError?: unknown;
  contacts?: ContactDto[];
  notes?: ContactDto[];
};

export function createJobsDataAccessMock(
  options: JobsDataAccessMockOptions = {},
) {
  const selectJobCalls: Array<number | null> = [];
  const updateJobStatusCalls: Array<[number, JobStatusDto]> = [];
  const createJobCalls: Array<CreateJobDto> = [];
  const updateJobCalls: Array<[number, UpdateJobDto]> = [];
  const jobs = options.jobs ?? [];
  const detail = options.detail ?? jobs[0] ?? jobFixtures.frontendEngineer;
  const contacts = options.contacts ?? [];
  const notes = options.notes ?? [];

  const jobsResource: ResourceState<JobDto[]> = {
    value: () => jobs,
    isLoading: () => false,
    reload: () => undefined,
    error: () => options.jobsError ?? null,
  };

  const jobResource: ResourceState<JobDto> = {
    value: () => detail,
    isLoading: () => false,
    reload: () => undefined,
    error: () => options.detailError ?? null,
  };

  const jobContactsResource: ResourceState<ContactDto[]> = {
    value: () => contacts,
    isLoading: () => false,
    reload: () => undefined,
    error: () => null,
  };

  const jobNotesResource: ResourceState<ContactDto[]> = {
    value: () => notes,
    isLoading: () => false,
    reload: () => undefined,
    error: () => null,
  };

  return {
    jobsResource,
    jobResource,
    jobContactsResource,
    jobNotesResource,
    selectJob: (id: number | null) => {
      selectJobCalls.push(id);
    },
    updateJobStatus: async (id: number, status: JobStatusDto) => {
      updateJobStatusCalls.push([id, status]);

      return {
        ...detail,
        id,
        status,
      };
    },
    createJob: async (dto: CreateJobDto) => {
      createJobCalls.push(dto);
      return {
        ...jobFixtures.frontendEngineer,
        ...dto,
        id: 1,
      };
    },
    updateJob: async (id: number, dto: UpdateJobDto) => {
      updateJobCalls.push([id, dto]);
      return {
        ...detail,
        id,
        ...dto,
      };
    },
    __calls: {
      selectJobCalls,
      updateJobStatusCalls,
      createJobCalls,
      updateJobCalls,
    },
  };
}
