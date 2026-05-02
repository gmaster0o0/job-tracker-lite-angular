import { TestBed } from '@angular/core/testing';
import { JobListComponent } from './job-list.component';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  createJobsDataAccessMock,
  jobFixtures,
} from '@job-tracker-lite-angular/shared-testing';

describe('JobListComponent', () => {
  beforeEach(async () => {
    const dataAccessServiceMock = createJobsDataAccessMock({
      jobs: [jobFixtures.frontendEngineer, jobFixtures.backendEngineer],
    });

    await TestBed.configureTestingModule({
      imports: [JobListComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: dataAccessServiceMock },
      ],
    }).compileComponents();
  });

  it('should render one card per job', () => {
    const fixture = TestBed.createComponent(JobListComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-job-card').length).toBe(
      2,
    );
  });
});
