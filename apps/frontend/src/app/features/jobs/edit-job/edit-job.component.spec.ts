import { createNotificationServiceMock } from '@job-tracker-lite-angular/testing';
import { NotificationService } from '@job-tracker-lite-angular/frontend-data-access';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import {
  JobsDataAccessService,
  BackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  jobFixtures,
  createJobsDataAccessMock,
  updateJobFixtures,
} from '@job-tracker-lite-angular/testing';
import { vi } from 'vitest';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { createBrnDialogRefMock } from '@job-tracker-lite-angular/testing';
import { EditJobComponent } from './edit-job.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { EditJobHarness } from './edit-job.harness';

describe('EditJobComponent', () => {
  let fixture: ComponentFixture<EditJobComponent>;
  let harness: EditJobHarness;
  let jobsDataAccessMock: any;

  beforeEach(async () => {
    jobsDataAccessMock = createJobsDataAccessMock();

    await TestBed.configureTestingModule({
      imports: [EditJobComponent, getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useValue: createNotificationServiceMock(),
        },
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        {
          provide: DIALOG_DATA,
          useValue: { job: jobFixtures.frontendEngineer },
        },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditJobComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditJobHarness,
    );
  });

  it('should create', async () => {
    expect(harness).toBeTruthy();
  });

  it('should initialize form with job data', async () => {
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
      status: jobFixtures.frontendEngineer.status,
    });
    jobsDataAccessMock.updateJob = updateJob;

    await harness.fillForm(updateJobFixtures['updatedFrontendEngineer']);
    await harness.submit();

    expect(updateJob).toHaveBeenCalledWith(jobFixtures.frontendEngineer.id, {
      ...updateJobFixtures['updatedFrontendEngineer'],
      status: 'SAVED',
    });
  });

  it('should not submit if form invalid', async () => {
    const updateJob = vi.fn();
    jobsDataAccessMock.updateJob = updateJob;

    await harness.fillForm({ company: '' });
    await harness.submit();

    expect(updateJob).not.toHaveBeenCalled();
  });

  it('should set submit error on failure', async () => {
    const backendError = new Error('Backend error: not_unique') as BackendError;
    (backendError as any).errorCode = 'not_unique';
    (backendError as any).statusCode = 409;

    const updateJob = vi.fn().mockRejectedValue(backendError);
    jobsDataAccessMock.updateJob = updateJob;

    await harness.fillForm(updateJobFixtures['updatedFrontendEngineer']);
    await harness.submit();

    expect(await harness.isErrorVisible()).toBe(true);
  });
});
