import { HttpErrorResponse } from '@angular/common/http';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { JobDto } from '@job-tracker-lite-angular/api-interfaces';
import {
  JobsDataAccessService,
  ContactsDataAccessService,
  NotesDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import { JobDetailComponent } from './job-detail.component';
import {
  createContactsDataAccessMock,
  createNotesDataAccessMock,
  createJobsDataAccessMock,
  jobFixtures,
} from '@job-tracker-lite-angular/testing';
import { JobDetailHarness } from './job-detail.harness';

describe('JobDetailComponent', () => {
  const baseJob = jobFixtures.platformEngineer;

  async function setup(options: {
    id: string;
    jobs: JobDto[];
    detail?: JobDto;
    detailError?: unknown;
  }) {
    const dataAccessServiceMock = createJobsDataAccessMock({
      jobs: options.jobs,
      detail: options.detail,
      detailError: options.detailError,
    });

    await TestBed.configureTestingModule({
      imports: [JobDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: options.id })) },
        },
        { provide: JobsDataAccessService, useValue: dataAccessServiceMock },
        {
          provide: ContactsDataAccessService,
          useValue: createContactsDataAccessMock(),
        },
        {
          provide: NotesDataAccessService,
          useValue: createNotesDataAccessMock(),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(JobDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      JobDetailHarness,
    );

    return { fixture, harness, dataAccessServiceMock };
  }

  it('should render overview details for selected job from fallback list', async () => {
    const { harness } = await setup({
      id: '10',
      jobs: [baseJob],
    });

    const text = await harness.getTextContent();
    expect(text).toContain('Platform Engineer');
    expect(text).toContain('Massive Dynamic');
    expect(text).toContain(jobFixtures.platformEngineer.description);
  });

  it('should render not found state when selected job does not exist', async () => {
    const { harness } = await setup({
      id: '999',
      jobs: [baseJob],
      detailError: new HttpErrorResponse({ status: 404 }),
    });

    expect(await harness.getTextContent()).toContain('Job not found.');
  });

  it('should update status when stepper emits stepSelected', async () => {
    const { fixture, harness, dataAccessServiceMock } = await setup({
      id: '10',
      jobs: [baseJob],
    });

    await harness.clickProgressStep(1);
    await fixture.whenStable();

    expect(dataAccessServiceMock.__calls.updateJobStatusCalls).toEqual([
      [10, 'applied'],
    ]);
  });
});
