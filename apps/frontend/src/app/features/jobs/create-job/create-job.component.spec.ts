import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
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

// use shared mock from libs/shared/testing

describe('CreateJobComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [CreateJobComponent],
      providers: [
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateJobComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateJobHarness,
    );
    expect(harness).toBeTruthy();
  });

  it('should keep submit disabled while form is invalid', async () => {
    await TestBed.configureTestingModule({
      imports: [CreateJobComponent],
      providers: [
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateJobComponent);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateJobHarness,
    );

    expect(await harness.isSubmitDisabled()).toBe(true);
  });

  it('should submit and create job', async () => {
    const createJob = vi.fn().mockResolvedValue(jobFixtures.frontendEngineer);
    const jobsDataAccessMock = createJobsDataAccessMock();
    jobsDataAccessMock.createJob = createJob;

    await TestBed.configureTestingModule({
      imports: [CreateJobComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateJobComponent);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateJobHarness,
    );

    await harness.fillForm(createJobFixtures.designer);
    await harness.submit();

    expect(createJob).toHaveBeenCalledWith(createJobFixtures.designer);
  });

  it('should not submit if form invalid', async () => {
    const createJob = vi.fn();
    const jobsDataAccessMock = createJobsDataAccessMock();
    jobsDataAccessMock.createJob = createJob;

    await TestBed.configureTestingModule({
      imports: [CreateJobComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateJobComponent);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateJobHarness,
    );

    await harness.fillForm(createJobFixtures.empty);
    await harness.submit();

    expect(createJob).not.toHaveBeenCalled();
  });

  it('should set submit error on failure', async () => {
    const createJob = vi.fn().mockRejectedValue(new Error('API error'));
    const jobsDataAccessMock = createJobsDataAccessMock();
    jobsDataAccessMock.createJob = createJob;

    await TestBed.configureTestingModule({
      imports: [CreateJobComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateJobComponent);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateJobHarness,
    );

    await harness.fillForm({
      position: 'Frontend Engineer',
      company: 'Acme Labs',
      link: 'https://example.com',
      description: 'Great job',
    });

    await harness.submit();

    expect(await harness.getSubmitErrorText()).toContain(
      'Failed to create job. Please try again.',
    );
  });
});
