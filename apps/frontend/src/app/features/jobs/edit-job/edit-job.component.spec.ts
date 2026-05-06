import { TestBed } from '@angular/core/testing';
import { BrnDialogContext } from '@spartan-ng/brain/dialog';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  jobFixtures,
  createJobsDataAccessMock,
  updateJobFixtures,
  createJobFixtures,
} from '@job-tracker-lite-angular/testing';
import { vi } from 'vitest';
import { EditJobComponent } from './edit-job.component';

describe('EditJobComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [EditJobComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize form with job data', async () => {
    const jobsDataAccessMock = createJobsDataAccessMock();

    await TestBed.configureTestingModule({
      imports: [EditJobComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    const component = fixture.componentInstance;

    // Since context is optional, job is undefined, form is empty
    expect(component.form.value).toEqual(createJobFixtures.empty);
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
          provide: BrnDialogContext,
          useValue: { job: jobFixtures.frontendEngineer },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    const component = fixture.componentInstance;

    component.form.setValue(updateJobFixtures.updatedFrontendEngineer);

    await component.submit();

    expect(updateJob).toHaveBeenCalledWith(
      jobFixtures.frontendEngineer.id,
      updateJobFixtures.updatedFrontendEngineer,
    );
  });

  it('should not submit if no job', async () => {
    const updateJob = vi.fn();
    const jobsDataAccessMock = createJobsDataAccessMock();
    jobsDataAccessMock.updateJob = updateJob;

    await TestBed.configureTestingModule({
      imports: [EditJobComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    const component = fixture.componentInstance;

    // job is undefined
    component.form.setValue(createJobFixtures.empty);

    await component.submit();

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
          provide: BrnDialogContext,
          useValue: { job: jobFixtures.frontendEngineer },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    const component = fixture.componentInstance;

    component.form.setValue(updateJobFixtures.updatedFrontendEngineer);

    await component.submit();

    expect(component.submitError()).toBe(
      'Failed to update job. Please try again.',
    );
  });
});
