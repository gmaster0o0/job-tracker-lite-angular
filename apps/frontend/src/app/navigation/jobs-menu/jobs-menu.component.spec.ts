import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JobsMenuComponent } from './jobs-menu.component';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { createJobsDataAccessMock } from '@job-tracker-lite-angular/testing';
import { JobsMenuHarness } from './jobs-menu.harness';

describe('JobsMenuComponent', () => {
  let harness: JobsMenuHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, JobsMenuComponent],
      providers: [
        {
          provide: JobsDataAccessService,
          useValue: createJobsDataAccessMock(),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(JobsMenuComponent);
    await fixture.whenStable();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      JobsMenuHarness,
    );
  });

  it.skip('should create', () => {
    expect(harness).toBeTruthy();
  });
});
