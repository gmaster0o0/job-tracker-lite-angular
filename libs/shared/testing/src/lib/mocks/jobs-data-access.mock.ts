import {
  ContactDto,
  JobDto,
  JobStatusDto,
} from '@job-tracker-lite-angular/api-interfaces';
import { jobFixtures } from '../fixtures/jobs.fixtures';

type ResourceState<T> = {
  value: () => T;
  isLoading: () => boolean;
  reload: () => void;
  error: () => unknown;
};

export type JobsDataAccessMockOptions = {
  jobs?: JobDto[];
  detail?: JobDto;
  detailError?: unknown;
  contacts?: ContactDto[];
};

export function createJobsDataAccessMock(
  options: JobsDataAccessMockOptions = {},
) {
  const selectJobCalls: Array<number | null> = [];
  const updateJobStatusCalls: Array<[number, JobStatusDto]> = [];
  const jobs = options.jobs ?? [];
  const detail = options.detail ?? jobs[0] ?? jobFixtures.frontendEngineer;
  const contacts = options.contacts ?? [];

  const jobsResource: ResourceState<JobDto[]> = {
    value: () => jobs,
    isLoading: () => false,
    reload: () => undefined,
    error: () => null,
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

  return {
    jobsResource,
    jobResource,
    jobContactsResource,
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
    __calls: {
      selectJobCalls,
      updateJobStatusCalls,
    },
  };
}
