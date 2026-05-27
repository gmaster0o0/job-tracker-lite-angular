import { Component, signal } from '@angular/core';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { NotesListComponent } from './notes-list.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import {
  NotesDataAccessService,
  JobsDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import { NotesListHarness } from './notes-list.harness';

@Component({
  standalone: true,
  imports: [NotesListComponent],
  template: ` <app-notes-list [jobId]="jobId" /> `,
})
class HostComponent {
  jobId = '1';
}

describe('NotesListComponent', () => {
  let harness: NotesListHarness;

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
      imports: [HostComponent, getTranslocoModule()],
      providers: [
        { provide: NotesDataAccessService, useValue: notesDataAccessMock },
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      NotesListHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });
});
