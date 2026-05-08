import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  jobFixtures,
  createJobsDataAccessMock,
  updateJobFixtures,
  createJobFixtures,
} from '@job-tracker-lite-angular/testing';
import { vi } from 'vitest';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { createBrnDialogRefMock } from '@job-tracker-lite-angular/testing';
import { EditJobComponent } from './edit-job.component';
import { EditJobHarness } from './edit-job.harness';

// use shared mock from libs/shared/testing

describe('EditJobComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [EditJobComponent],
      providers: [
        {
          provide: DIALOG_DATA,
          useValue: { job: jobFixtures.frontendEngineer },
        },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditJobHarness,
    );
    expect(harness).toBeTruthy();
  });

  it('should initialize form with job data', async () => {
    const jobsDataAccessMock = createJobsDataAccessMock();

    await TestBed.configureTestingModule({
      imports: [EditJobComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        {
          provide: DIALOG_DATA,
          useValue: { job: jobFixtures.frontendEngineer },
        },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditJobHarness,
    );

    expect(await harness.getCompanyValue()).toBe(
      jobFixtures.frontendEngineer.company,
    );
    expect(await harness.getPositionValue()).toBe(
      jobFixtures.frontendEngineer.position,
    );
  });

  it('should submit and update job', async () => {
    const updateJob = vi.fn().mockResolvedValue({
      ...jobFixtures.frontendEngineer,
      company: 'Updated Company',
    });
    const jobsDataAccessMock = createJobsDataAccessMock();
    jobsDataAccessMock.updateJob = updateJob;

    await TestBed.configureTestingModule({
      imports: [EditJobComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        {
          provide: DIALOG_DATA,
          useValue: { job: jobFixtures.frontendEngineer },
        },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditJobHarness,
    );

    await harness.fillForm(updateJobFixtures['updatedFrontendEngineer']);
    await harness.submit();

    expect(updateJob).toHaveBeenCalledWith(
      jobFixtures.frontendEngineer.id,
      updateJobFixtures['updatedFrontendEngineer'],
    );
  });

  it('should not submit if form invalid', async () => {
    const updateJob = vi.fn();
    const jobsDataAccessMock = createJobsDataAccessMock();
    jobsDataAccessMock.updateJob = updateJob;

    await TestBed.configureTestingModule({
      imports: [EditJobComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        {
          provide: DIALOG_DATA,
          useValue: { job: jobFixtures.frontendEngineer },
        },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditJobHarness,
    );

    await harness.fillForm({ company: '' });
    await harness.submit();

    expect(updateJob).not.toHaveBeenCalled();
  });

  it('should set submit error on failure', async () => {
    const updateJob = vi.fn().mockRejectedValue(new Error('API error'));
    const jobsDataAccessMock = createJobsDataAccessMock();
    jobsDataAccessMock.updateJob = updateJob;

    await TestBed.configureTestingModule({
      imports: [EditJobComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        {
          provide: DIALOG_DATA,
          useValue: { job: jobFixtures.frontendEngineer },
        },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditJobHarness,
    );

    await harness.fillForm(updateJobFixtures['updatedFrontendEngineer']);
    await harness.submit();

    expect(await harness.getSubmitErrorText()).toContain(
      'Failed to update job. Please try again.',
    );
  });
});
