import { TestBed } from '@angular/core/testing';
import { jobFixtures } from '@job-tracker-lite-angular/shared-testing';
import { JobCardComponent } from './job-card.component';

describe('JobCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCardComponent],
    }).compileComponents();
  });

  it('should render the position, company, and status', () => {
    const fixture = TestBed.createComponent(JobCardComponent);
    fixture.componentRef.setInput('job', jobFixtures.frontendEngineer);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Frontend Engineer');
    expect(fixture.nativeElement.textContent).toContain('Acme Labs');
    expect(fixture.nativeElement.textContent).toContain('saved');
  });
});
