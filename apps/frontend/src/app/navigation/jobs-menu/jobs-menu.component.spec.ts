import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JobsMenuComponent } from './jobs-menu.component';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { createJobsDataAccessMock } from '@job-tracker-lite-angular/shared-testing';

describe('JobsMenuComponent', () => {
  let component: JobsMenuComponent;
  let fixture: ComponentFixture<JobsMenuComponent>;

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

    fixture = TestBed.createComponent(JobsMenuComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
