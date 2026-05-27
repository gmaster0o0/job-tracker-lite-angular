import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { JobsMenuComponent } from './jobs-menu.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { createJobsDataAccessMock } from '@job-tracker-lite-angular/testing';
import { JobsMenuHarness } from './jobs-menu.harness';
import { provideRouter } from '@angular/router';

describe('JobsMenuComponent', () => {
  let harness: JobsMenuHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsMenuComponent, getTranslocoModule()],
      providers: [
        {
          provide: JobsDataAccessService,
          useValue: createJobsDataAccessMock(),
        },
        provideRouter([]),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(JobsMenuComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      JobsMenuHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });
});
