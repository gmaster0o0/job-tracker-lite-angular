import { TestBed } from '@angular/core/testing';
import { JobOverviewComponent } from './job-overview.component';
import { jobOverviewMarkdown } from '@job-tracker-lite-angular/shared-testing';

describe('JobOverviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobOverviewComponent],
    }).compileComponents();
  });

  it('should render markdown into formatted HTML', () => {
    const fixture = TestBed.createComponent(JobOverviewComponent);
    fixture.componentRef.setInput('description', jobOverviewMarkdown);
    fixture.detectChanges();

    const article = fixture.nativeElement.querySelector(
      'article',
    ) as HTMLElement;
    expect(article.innerHTML).toContain('<h1>Job Description</h1>');
    expect(article.innerHTML).toContain('<strong>important</strong>');
  });

  it('should show fallback text when description is empty', () => {
    const fixture = TestBed.createComponent(JobOverviewComponent);
    fixture.componentRef.setInput('description', '   ');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'No description provided.',
    );
  });
});
