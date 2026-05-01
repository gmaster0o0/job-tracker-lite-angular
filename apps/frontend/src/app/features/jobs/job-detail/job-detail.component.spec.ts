import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { JobDto, JobStatusDto } from '@job-tracker-lite-angular/api-interfaces';
import { JobsDataAccessService, ContactsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { ProgessionStepperComponent } from '../../../shared/progession-stepper/progession-stepper.component';
import { JobDetailComponent } from './job-detail.component';

describe('JobDetailComponent', () => {
  const baseJob: JobDto = {
    id: 10,
    position: 'Platform Engineer',
    company: 'Massive Dynamic',
    link: 'https://example.com/jobs/platform-engineer',
    description: 'Build scalable tooling',
    status: 'saved',
    createdAt: '2026-04-29T00:33:16.783Z',
    updatedAt: '2026-04-30T14:55:48.519Z',
  };

  async function setup(options: {
    id: string;
    jobs: JobDto[];
    detail?: JobDto;
    detailError?: unknown;
  }) {
    const selectJobCalls: Array<number | null> = [];
    const updateJobStatusCalls: Array<[number, JobStatusDto]> = [];

    const dataAccessServiceMock = {
      jobsResource: {
        value: () => options.jobs,
        isLoading: () => false,
        reload: () => undefined,
      },
      jobResource: {
        value: () => options.detail,
        isLoading: () => false,
        error: () => options.detailError ?? null,
        reload: () => undefined,
      },
      selectJob: (id: number | null) => {
        selectJobCalls.push(id);
      },
      updateJobStatus: async (id: number, status: JobStatusDto) => {
        updateJobStatusCalls.push([id, status]);
        return { ...baseJob, status: 'applied' as const };
      },
      __calls: {
        selectJobCalls,
        updateJobStatusCalls,
      },
    };

    await TestBed.configureTestingModule({
      imports: [JobDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: options.id })) },
        },
        { provide: JobsDataAccessService, useValue: dataAccessServiceMock },
        { provide: ContactsDataAccessService, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(JobDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, dataAccessServiceMock };
  }

  it('should render overview details for selected job from fallback list', async () => {
    const { fixture } = await setup({
      id: '10',
      jobs: [{ ...baseJob, status: 'interview' }],
    });

    expect(fixture.nativeElement.textContent).toContain('Platform Engineer');
    expect(fixture.nativeElement.textContent).toContain('Massive Dynamic');
    expect(fixture.nativeElement.textContent).toContain(
      'Build scalable tooling',
    );
  });

  it('should render not found state when selected job does not exist', async () => {
    const { fixture } = await setup({
      id: '999',
      jobs: [baseJob],
      detailError: new HttpErrorResponse({ status: 404 }),
    });

    expect(fixture.nativeElement.textContent).toContain('Job not found.');
  });

  it('should update status when stepper emits stepSelected', async () => {
    const { fixture, dataAccessServiceMock } = await setup({
      id: '10',
      jobs: [baseJob],
    });

    const stepper = fixture.debugElement.query(
      By.directive(ProgessionStepperComponent),
    ).componentInstance as ProgessionStepperComponent;

    stepper.stepSelected.emit(1);
    await fixture.whenStable();

    expect(dataAccessServiceMock.__calls.updateJobStatusCalls).toEqual([
      [10, 'applied'],
    ]);
  });
});
