import { TestBed } from '@angular/core/testing';
import { JobCardComponent } from './job-card.component';

describe('JobCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCardComponent],
    }).compileComponents();
  });

  it('should render the position, company, and status', () => {
    const fixture = TestBed.createComponent(JobCardComponent);
    fixture.componentRef.setInput('job', {
      id: 1,
      position: 'Frontend Engineer',
      link: 'https://example.com/jobs/frontend-engineer',
      description: 'Build Angular apps',
      company: 'Acme Labs',
      status: 'saved',
      createdAt: '2026-04-29T09:00:00.000Z',
      updatedAt: '2026-04-29T09:00:00.000Z',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Frontend Engineer');
    expect(fixture.nativeElement.textContent).toContain('Acme Labs');
    expect(fixture.nativeElement.textContent).toContain('saved');
  });
});
