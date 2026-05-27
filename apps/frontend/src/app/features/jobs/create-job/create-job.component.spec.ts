import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import {
  JobsDataAccessService,
  BackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  jobFixtures,
  createJobsDataAccessMock,
  createJobFixtures,
} from '@job-tracker-lite-angular/testing';
import { vi } from 'vitest';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { createBrnDialogRefMock } from '@job-tracker-lite-angular/testing';
import { CreateJobComponent } from './create-job.component';
import { CreateJobHarness } from './create-job.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('CreateJobComponent', () => {
  let fixture: ComponentFixture<CreateJobComponent>;
  let harness: CreateJobHarness;
  let jobsDataAccessMock: any;

  beforeEach(async () => {
    jobsDataAccessMock = createJobsDataAccessMock();

    await TestBed.configureTestingModule({
      imports: [CreateJobComponent, getTranslocoModule()],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateJobComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateJobHarness,
    );
    // do NOT call fixture.detectChanges() here so tests can set spies first
  });

  it('should create', async () => {
    expect(harness).toBeTruthy();
  });

  it('should keep submit disabled while form is invalid', async () => {
    expect(await harness.isSubmitDisabled()).toBe(true);
    expect(await harness.isErrorVisible()).toBe(false);
  });

  it('should submit and create job', async () => {
    const createJob = vi.fn().mockResolvedValue(jobFixtures.frontendEngineer);
    jobsDataAccessMock.createJob = createJob;

    await harness.fillForm(createJobFixtures.designer);
    await harness.submit();

    expect(createJob).toHaveBeenCalledWith({
      ...createJobFixtures.designer,
      status: 'SAVED',
    });
  });

  it('should not submit if form invalid', async () => {
    const createJob = vi.fn();
    jobsDataAccessMock.createJob = createJob;

    await harness.fillForm(createJobFixtures.empty);
    await harness.submit();

    expect(createJob).not.toHaveBeenCalled();
  });

  it('should set submit error on failure', async () => {
    const backendError = new Error('Backend error: not_unique') as BackendError;
    (backendError as any).errorCode = 'not_unique';
    (backendError as any).statusCode = 409;

    const createJob = vi.fn().mockRejectedValue(backendError);
    jobsDataAccessMock.createJob = createJob;

    await harness.fillForm(createJobFixtures.designer);
    await harness.submit();

    expect(await harness.isErrorVisible()).toBe(true);
  });
});
