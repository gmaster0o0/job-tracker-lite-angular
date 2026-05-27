import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { JobOverviewComponent } from './job-overview.component';
import { jobOverviewMarkdown } from '@job-tracker-lite-angular/testing';
import { JobOverviewHarness } from './job-overview.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('JobOverviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobOverviewComponent, getTranslocoModule()],
    }).compileComponents();
  });

  it('should render markdown into formatted HTML', async () => {
    const fixture = TestBed.createComponent(JobOverviewComponent);
    fixture.componentRef.setInput('description', jobOverviewMarkdown);

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      JobOverviewHarness,
    );

    const html = await harness.getArticleHtml();
    expect(html).toContain('<h1>Job Description</h1>');
    expect(html).toContain('<strong>important</strong>');
  });

  it('should show fallback text when description is empty', async () => {
    const fixture = TestBed.createComponent(JobOverviewComponent);
    fixture.componentRef.setInput('description', '   ');

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      JobOverviewHarness,
    );

    expect(await harness.getTextContent()).toContain(
      'No description provided.',
    );
  });
});
