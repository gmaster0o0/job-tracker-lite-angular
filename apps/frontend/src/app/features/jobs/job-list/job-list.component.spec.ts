import { TestBed } from '@angular/core/testing';
import { JobListComponent } from './job-list.component';

describe('JobListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobListComponent],
    }).compileComponents();
  });

  it('should render one card per job', () => {
    const fixture = TestBed.createComponent(JobListComponent);
    fixture.componentRef.setInput('jobs', [
      {
        id: 1,
        position: 'Frontend Engineer',
        link: 'https://example.com/jobs/frontend-engineer',
        description: 'Build Angular apps',
        company: 'Acme Labs',
        status: 'saved',
        createdAt: '2026-04-29T09:00:00.000Z',
        updatedAt: '2026-04-29T09:00:00.000Z',
      },
      {
        id: 2,
        position: 'Backend Engineer',
        link: 'https://example.com/jobs/backend-engineer',
        description: 'Own Nest APIs',
        company: 'Globex',
        status: 'applied',
        createdAt: '2026-04-29T09:00:00.000Z',
        updatedAt: '2026-04-29T09:00:00.000Z',
      },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-job-card').length).toBe(
      2,
    );
  });
});
