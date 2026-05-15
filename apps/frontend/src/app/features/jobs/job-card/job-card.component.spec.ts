import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { jobFixtures } from '@job-tracker-lite-angular/testing';
import { JobCardComponent } from './job-card.component';
import { JobCardHarness } from './job-card.harness';
import { JobStatus } from '@job-tracker-lite-angular/schemas';

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

    return TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      JobCardHarness,
    ).then(async (harness) => {
      const text = await harness.getTextContent();

      expect(text).toContain('Frontend Engineer');
      expect(text).toContain('Acme Labs');
      expect(text).toContain(JobStatus.SAVED);
    });
  });
});
