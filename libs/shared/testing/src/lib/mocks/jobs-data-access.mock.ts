import { signal } from '@angular/core';
import {
  ContactDto,
  CreateJobDto,
  JobDto,
  JobStatusDto,
  UpdateJobDto,
} from '@job-tracker-lite-angular/schemas';
import { jobFixtures } from '../fixtures/jobs.fixtures';
import { ResourceState } from './ResourceState';
import { JobsScenario } from '../scenarios/jobs.scnearios';

export type JobsDataAccessMockOptions = {
  jobs?: JobDto[];
  jobsError?: unknown;
  job?: JobDto | undefined;
  jobError?: unknown;
  jobsLoading?: boolean;
  jobLoading?: boolean;
  contacts?: ContactDto[];
  notes?: ContactDto[];
};

/**
 * Factory function to create a jobs data access mock based on a given scenario.
 * @param scenario
 */
export function createJobsMockByScenario(
  scenario: JobsScenario,
): ReturnType<typeof createJobsDataAccessMock> {
  switch (scenario) {
    case 'happyPath':
      return createJobsDataAccessMock({
        jobs: [jobFixtures.platformEngineer],
        job: jobFixtures.platformEngineer,
      });
    case 'noData':
      return createJobsDataAccessMock({
        jobs: [],
        job: undefined,
      });
    case 'notFound':
      return createJobsDataAccessMock({
        jobs: [],
        job: undefined,
        jobError: { status: 404, statusText: 'Not Found' },
      });
    case 'serverError':
      return createJobsDataAccessMock({
        jobs: [],
        job: undefined,
        jobError: { status: 500, statusText: 'Internal Server Error' },
      });
    case 'loading':
      return createJobsDataAccessMock({
        jobs: [],
        job: undefined,
        jobsLoading: true,
        jobLoading: true,
      });
  }
}

/**
 * Factory function to create a jobs data access mock based on given options.
 * @param options
 * @returns
 */
export function createJobsDataAccessMock(
  options: JobsDataAccessMockOptions = {},
) {
  const selectJobCalls: Array<string | null> = [];
  const updateJobStatusCalls: Array<[string, JobStatusDto]> = [];
  const createJobCalls: Array<CreateJobDto> = [];
  const updateJobCalls: Array<[string, UpdateJobDto]> = [];
  const jobs = options.jobs ?? [];
  const job =
    'job' in options ? options.job : (jobs[0] ?? jobFixtures.frontendEngineer);
  const contacts = options.contacts ?? [];
  const notes = options.notes ?? [];

  const jobsResource: ResourceState<JobDto[]> = {
    value: () => jobs,
    isLoading: () => options.jobsLoading ?? false,
    reload: () => undefined,
    error: () => options.jobsError ?? null,
  };

  const jobResource: ResourceState<JobDto> = {
    value: () => job,
    isLoading: () => options.jobLoading ?? false,
    reload: () => undefined,
    error: () => options.jobError ?? null,
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

  // Mutable resource state for create/update operations to support test scenarios
  const createJobResourceStatus = signal<
    'idle' | 'loading' | 'resolved' | 'error'
  >('idle');
  const createJobResourceError = signal<any>(null);
  const createJobResourceValue = signal<JobDto | null>(null);

  const createJobResource = {
    value: () => createJobResourceValue(),
    status: () => createJobResourceStatus(),
    error: () => createJobResourceError(),
  };

  const updateJobResourceStatus = signal<
    'idle' | 'loading' | 'resolved' | 'error'
  >('idle');
  const updateJobResourceError = signal<any>(null);
  const updateJobResourceValue = signal<JobDto | null>(null);

  const updateJobResource = {
    value: () => updateJobResourceValue(),
    status: () => updateJobResourceStatus(),
    error: () => updateJobResourceError(),
  };

  return {
    jobsResource,
    jobResource,
    jobContactsResource,
    jobNotesResource,
    createJobResource,
    updateJobResource,
    selectJob: (id: string | null) => {
      selectJobCalls.push(id);
    },
    updateJobStatus: async (id: string, status: JobStatusDto) => {
      updateJobStatusCalls.push([id, status]);

      return {
        ...job,
        id,
        status,
      };
    },
    createJob: async (dto: CreateJobDto) => {
      createJobCalls.push(dto);
      createJobResourceStatus.set('loading');
      createJobResourceError.set(null);
      try {
        const result: JobDto = {
          ...jobFixtures.frontendEngineer,
          ...dto,
          id: 'ck1234567890',
        } as JobDto;
        createJobResourceValue.set(result);
        createJobResourceStatus.set('resolved');
        return result;
      } catch (error) {
        createJobResourceError.set(error);
        createJobResourceStatus.set('error');
        throw error;
      }
    },
    updateJob: async (id: string, dto: UpdateJobDto) => {
      updateJobCalls.push([id, dto]);
      updateJobResourceStatus.set('loading');
      updateJobResourceError.set(null);
      try {
        const result = {
          ...job,
          id,
          ...dto,
        } as JobDto;
        updateJobResourceValue.set(result);
        updateJobResourceStatus.set('resolved');
        return result;
      } catch (error) {
        updateJobResourceError.set(error);
        updateJobResourceStatus.set('error');
        throw error;
      }
    },
    resetCreateJob: () => {
      createJobResourceStatus.set('idle');
      createJobResourceError.set(null);
      createJobResourceValue.set(null);
    },
    resetUpdateJob: () => {
      updateJobResourceStatus.set('idle');
      updateJobResourceError.set(null);
      updateJobResourceValue.set(null);
    },
    __calls: {
      selectJobCalls,
      updateJobStatusCalls,
      createJobCalls,
      updateJobCalls,
    },
    // Expose resource state signals for tests to manually trigger errors
    __setCreateJobError: (error: any) => {
      createJobResourceStatus.set('error');
      createJobResourceError.set(error);
    },
    __setUpdateJobError: (error: any) => {
      updateJobResourceStatus.set('error');
      updateJobResourceError.set(error);
    },
  };
}
