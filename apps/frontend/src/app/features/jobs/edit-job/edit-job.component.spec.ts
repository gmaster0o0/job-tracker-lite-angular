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

// use shared mock from libs/shared/testing

describe('EditJobComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [EditJobComponent],
      providers: [
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
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
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    const component = fixture.componentInstance as any;

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
          provide: DIALOG_DATA,
          useValue: { job: jobFixtures.frontendEngineer },
        },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    const component = fixture.componentInstance as any;

    component.form.setValue(updateJobFixtures['updatedFrontendEngineer']);

    await component.submit();

    expect(updateJob).toHaveBeenCalledWith(
      jobFixtures.frontendEngineer.id,
      updateJobFixtures['updatedFrontendEngineer'],
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
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    const component = fixture.componentInstance as any;

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
          provide: DIALOG_DATA,
          useValue: { job: jobFixtures.frontendEngineer },
        },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditJobComponent);
    const component = fixture.componentInstance as any;

    component.form.setValue(updateJobFixtures['updatedFrontendEngineer']);

    await component.submit();

    expect(component.submitError()).toBe(
      'Failed to update job. Please try again.',
    );
  });
});
