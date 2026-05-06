import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotesListComponent } from './notes-list.component';
import {
  NotesDataAccessService,
  JobsDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';

@Component({
  standalone: true,
  imports: [NotesListComponent],
  template: ` <app-notes-list [jobId]="jobId" /> `,
})
class HostComponent {
  jobId = 1;
}

describe('NotesListComponent', () => {
  let component: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    const notesDataAccessMock = {
      notesResource: {
        value: signal([]),
        isLoading: signal(false),
        error: signal(null),
        reload: () => {
          /*empty*/
        },
      },
    };
    const jobsDataAccessMock = {};

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: NotesDataAccessService, useValue: notesDataAccessMock },
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
