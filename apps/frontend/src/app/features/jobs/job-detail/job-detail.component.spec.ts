import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { JobDto, JobStatusDto } from '@job-tracker-lite-angular/api-interfaces';
import {
  JobsDataAccessService,
  ContactsDataAccessService,
  NotesDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { JobDetailComponent } from './job-detail.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import {
  createContactsDataAccessMock,
  createNotesDataAccessMock,
  createJobsDataAccessMock,
  createJobsMockByScenario,
  jobFixtures,
} from '@job-tracker-lite-angular/testing';
import { JobDetailHarness } from './job-detail.harness';

type JobDetailTestComponent = {
  activeTab: () => string;
  onTabSelected: (tab: string) => void;
  formatStatus: (status: JobStatusDto) => string;
  isRejected: (job: JobDto) => boolean;
  currentProgressIndex: (job: JobDto) => number;
  moveToStatus: (status: JobStatusDto, job: JobDto) => Promise<void>;
  openCreateJobDialog: () => void;
  openDeleteJobDialog: (job: JobDto) => void;
};

type DialogOpenCall = {
  component: unknown;
  config: {
    context: {
      onCreated?: (created: JobDto) => unknown;
      onConfirm?: () => Promise<void>;
    };
    [key: string]: unknown;
  };
};

describe('JobDetailComponent', () => {
  const baseJob = jobFixtures.platformEngineer;

  async function setup(options: {
    id: string;
    jobs?: JobDto[];
    job?: JobDto;
    jobError?: unknown;
    router?: { navigate: (...args: unknown[]) => Promise<boolean> };
    dialog?: { open: (component: unknown, config: unknown) => unknown };
    jobsDataAccessMock?: ReturnType<typeof createJobsDataAccessMock> & {
      deleteJob?: (id: string) => Promise<void>;
    };
  }) {
    // TODO why this mock is here?
    const dataAccessServiceMock =
      options.jobsDataAccessMock ??
      createJobsDataAccessMock({
        jobs: options.jobs,
        jobError: options.jobError,
        ...(options.job !== undefined ? { job: options.job } : {}),
      });

    const routerNavigateCalls: unknown[] = [];
    const router =
      options.router ??
      ({
        navigate: async (...args: unknown[]) => {
          routerNavigateCalls.push(args.length === 1 ? args[0] : args);
          return true;
        },
      } as const);

    const dialogOpenCalls: DialogOpenCall[] = [];
    const dialog =
      options.dialog ??
      ({
        open: (component: unknown, config: DialogOpenCall['config']) => {
          dialogOpenCalls.push({ component, config });
          return undefined;
        },
      } as const);

    await TestBed.configureTestingModule({
      imports: [JobDetailComponent, getTranslocoModule()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: options.id })) },
        },
        { provide: JobsDataAccessService, useValue: dataAccessServiceMock },
        {
          provide: ContactsDataAccessService,
          useValue: createContactsDataAccessMock(),
        },
        {
          provide: NotesDataAccessService,
          useValue: createNotesDataAccessMock(),
        },
        { provide: Router, useValue: router },
        { provide: HlmDialogService, useValue: dialog },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(JobDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      JobDetailHarness,
    );

    return {
      fixture,
      harness,
      dataAccessServiceMock,
      dialogOpenCalls,
      routerNavigateCalls,
    };
  }

  it('should render overview details for selected job from fallback list', async () => {
    const { harness } = await setup({
      id: baseJob.id,
      jobs: [baseJob],
    });

    const text = await harness.getTextContent();
    expect(text).toContain('Platform Engineer');
    expect(text).toContain('Massive Dynamic');
    expect(text).toContain(jobFixtures.platformEngineer.description);
  });

  it('should render not found state when selected job does not exist', async () => {
    const dataAccessServiceMock = createJobsMockByScenario('notFound');

    const { harness } = await setup({
      id: '999',
      jobsDataAccessMock: dataAccessServiceMock,
    });

    expect(await harness.getTextContent()).toContain('Job not found.');
  });

  it('should render job error state for non-404 failures', async () => {
    const dataAccessServiceMock = createJobsMockByScenario('serverError');

    const { harness } = await setup({
      id: '999',
      jobsDataAccessMock: dataAccessServiceMock,
    });

    expect(await harness.getTextContent()).toContain(
      'Failed to load job details. Please try again later.',
    );
  });

  it('should render jobs loading state when no job is available yet', async () => {
    const dataAccessServiceMock = createJobsMockByScenario('loading');

    const { harness } = await setup({
      id: baseJob.id,
      jobsDataAccessMock: dataAccessServiceMock,
    });

    expect(await harness.getTextContent()).toContain('Loading job details...');
  });

  it('should render job not found when route id does not match an existing job', async () => {
    const dataAccessServiceMock = createJobsMockByScenario('notFound');

    const { harness } = await setup({
      id: 'inv',
      jobsDataAccessMock: dataAccessServiceMock,
    });

    expect(await harness.getTextContent()).toContain('Job not found.');
  });

  it('should update status when stepper emits stepSelected', async () => {
    const { fixture, harness, dataAccessServiceMock } = await setup({
      id: baseJob.id,
      jobs: [baseJob],
    });

    await harness.clickProgressStep(1);
    await fixture.whenStable();

    expect(dataAccessServiceMock.__calls.updateJobStatusCalls).toEqual([
      [baseJob.id, 'applied'],
    ]);
  });

  it('should preserve active tab when an unknown tab is selected', async () => {
    const { fixture } = await setup({
      id: baseJob.id,
      jobs: [baseJob],
    });

    const component =
      fixture.componentInstance as unknown as JobDetailTestComponent;
    component.onTabSelected('invalid-tab');

    expect(component.activeTab()).toBe('overview');
  });

  it('should switch active tab when a known tab is selected', async () => {
    const { fixture } = await setup({
      id: baseJob.id,
      jobs: [baseJob],
    });

    const component =
      fixture.componentInstance as unknown as JobDetailTestComponent;
    component.onTabSelected('notes');

    expect(component.activeTab()).toBe('notes');
  });

  it('should format job status to uppercase', async () => {
    const { fixture } = await setup({
      id: baseJob.id,
      jobs: [baseJob],
    });

    const component =
      fixture.componentInstance as unknown as JobDetailTestComponent;

    expect(component.formatStatus('applied')).toBe('APPLIED');
  });

  it('should identify rejected jobs and return -1 for rejected progress index', async () => {
    const rejectedJob = jobFixtures.juniorReactDeveloper;
    const { fixture } = await setup({
      id: rejectedJob.id,
      jobs: [rejectedJob],
      job: rejectedJob,
    });

    const component =
      fixture.componentInstance as unknown as JobDetailTestComponent;

    expect(component.isRejected(rejectedJob)).toBe(true);
    expect(component.currentProgressIndex(rejectedJob)).toBe(-1);
  });

  it('should not call updateJobStatus when moving to the same status', async () => {
    const { fixture, dataAccessServiceMock } = await setup({
      id: baseJob.id,
      jobs: [baseJob],
      job: baseJob,
    });

    const component =
      fixture.componentInstance as unknown as JobDetailTestComponent;
    await component.moveToStatus('job offered', baseJob);

    expect(dataAccessServiceMock.__calls.updateJobStatusCalls).toEqual([]);
  });

  it('should navigate after creating a new job', async () => {
    const { fixture, dialogOpenCalls, routerNavigateCalls } = await setup({
      id: baseJob.id,
      jobs: [baseJob],
      job: baseJob,
    });

    const component =
      fixture.componentInstance as unknown as JobDetailTestComponent;
    component.openCreateJobDialog();

    expect(dialogOpenCalls).toHaveLength(1);

    const createdJob: JobDto = { ...baseJob, id: 'ck1234567899' };
    const onCreated = dialogOpenCalls[0].config.context.onCreated;
    expect(onCreated).toBeDefined();
    await onCreated?.(createdJob);

    expect(routerNavigateCalls).toEqual([['/jobs', 'ck1234567899']]);
  });

  it('should delete job and navigate to jobs when delete is confirmed', async () => {
    const deleteJobCalls: string[] = [];
    const dataAccessServiceMock = createJobsDataAccessMock({
      jobs: [baseJob],
      job: baseJob,
    }) as ReturnType<typeof createJobsDataAccessMock> & {
      deleteJob: (id: string) => Promise<void>;
    };
    dataAccessServiceMock.deleteJob = async (id: string) => {
      deleteJobCalls.push(id);
    };

    const { fixture, dialogOpenCalls, routerNavigateCalls } = await setup({
      id: baseJob.id,
      jobs: [baseJob],
      job: baseJob,
      jobsDataAccessMock: dataAccessServiceMock,
    });

    const component =
      fixture.componentInstance as unknown as JobDetailTestComponent;
    component.openDeleteJobDialog(baseJob);

    expect(dialogOpenCalls).toHaveLength(1);

    const onConfirm = dialogOpenCalls[0].config.context.onConfirm;
    expect(onConfirm).toBeDefined();
    await onConfirm?.();

    expect(deleteJobCalls).toEqual([baseJob.id]);
    expect(routerNavigateCalls).toEqual([['/jobs']]);
  });
});
