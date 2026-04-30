import { TestBed } from '@angular/core/testing';
import { JobListComponent } from './job-list.component';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';

describe('JobListComponent', () => {
  beforeEach(async () => {
    const dataAccessServiceMock = {
      jobsResource: {
        value: () => [
          {
            id: 1,
            position: 'Frontend Engineer',
            link: 'https://example.com/jobs/frontend-engineer',
            description: 'Build Angular apps',
            company: 'Acme Labs',
            status: 'saved' as const,
            createdAt: '2026-04-29T09:00:00.000Z',
            updatedAt: '2026-04-29T09:00:00.000Z',
          },
          {
            id: 2,
            position: 'Backend Engineer',
            link: 'https://example.com/jobs/backend-engineer',
            description: 'Own Nest APIs',
            company: 'Globex',
            status: 'applied' as const,
            createdAt: '2026-04-29T09:00:00.000Z',
            updatedAt: '2026-04-29T09:00:00.000Z',
          },
        ],
      },
    };

    await TestBed.configureTestingModule({
      imports: [JobListComponent],
      providers: [
        { provide: DataAccessService, useValue: dataAccessServiceMock },
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
