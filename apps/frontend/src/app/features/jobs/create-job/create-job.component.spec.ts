import { TestBed } from '@angular/core/testing';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  jobFixtures,
  createJobsDataAccessMock,
  createJobFixtures,
} from '@job-tracker-lite-angular/testing';
import { vi } from 'vitest';
import { CreateJobComponent } from './create-job.component';

describe('CreateJobComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [CreateJobComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateJobComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have form with required fields', async () => {
    await TestBed.configureTestingModule({
      imports: [CreateJobComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateJobComponent);
    const component = fixture.componentInstance;

    expect(component.form.get('position')?.hasValidator('required')).toBe(true);
    expect(component.form.get('company')?.hasValidator('required')).toBe(true);
    expect(component.form.get('link')?.hasValidator('required')).toBe(true);
    expect(component.form.get('description')?.hasValidator('required')).toBe(
      true,
    );
  });

  it('should submit and create job', async () => {
    const createJob = vi.fn().mockResolvedValue(jobFixtures.frontendEngineer);
    const jobsDataAccessMock = createJobsDataAccessMock();
    jobsDataAccessMock.createJob = createJob;

    await TestBed.configureTestingModule({
      imports: [CreateJobComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateJobComponent);
    const component = fixture.componentInstance;

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
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateJobComponent);
    const component = fixture.componentInstance;

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
