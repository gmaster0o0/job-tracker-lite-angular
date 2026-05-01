import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JobsMenuComponent } from './jobs-menu.component';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';

describe('JobsMenuComponent', () => {
  let component: JobsMenuComponent;
  let fixture: ComponentFixture<JobsMenuComponent>;

  beforeEach(async () => {
    const dataAccessServiceMock = {
      jobsResource: {
        value: () => [],
        isLoading: () => false,
      },
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, JobsMenuComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: dataAccessServiceMock },
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
