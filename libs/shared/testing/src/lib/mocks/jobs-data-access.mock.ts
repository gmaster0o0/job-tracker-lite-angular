import {
  ContactDto,
  CreateJobDto,
  JobDto,
  JobStatusDto,
  UpdateJobDto,
} from '@job-tracker-lite-angular/api-interfaces';
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
  const selectJobCalls: Array<number | null> = [];
  const updateJobStatusCalls: Array<[number, JobStatusDto]> = [];
  const createJobCalls: Array<CreateJobDto> = [];
  const updateJobCalls: Array<[number, UpdateJobDto]> = [];
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
        ...job,
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
        ...job,
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
