import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
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
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have form with required fields', async () => {
    await TestBed.configureTestingModule({
      imports: [CreateJobComponent],
      providers: [
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateJobComponent);
    const component = fixture.componentInstance as any;

    expect(
      component.form.get('position')?.hasValidator(Validators.required),
    ).toBe(true);
    expect(
      component.form.get('company')?.hasValidator(Validators.required),
    ).toBe(true);
    expect(component.form.get('link')?.hasValidator(Validators.required)).toBe(
      true,
    );
    expect(
      component.form.get('description')?.hasValidator(Validators.required),
    ).toBe(true);
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
    const component = fixture.componentInstance as any;

    component.form.setValue(createJobFixtures.designer);

    await component.submit();

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
    const component = fixture.componentInstance as any;

    component.form.setValue(createJobFixtures.empty);

    await component.submit();

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
    const component = fixture.componentInstance as any;

    component.form.setValue({
      position: 'Frontend Engineer',
      company: 'Acme Labs',
      link: 'https://example.com',
      description: 'Great job',
    });

    await component.submit();

    expect(component.submitError()).toBe(
      'Failed to create job. Please try again.',
    );
  });
});
