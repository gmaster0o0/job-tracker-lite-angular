import { createNotificationServiceMock } from '@job-tracker-lite-angular/testing';
import { NotificationService } from '@job-tracker-lite-angular/frontend-data-access';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { ContactDto } from '@job-tracker-lite-angular/schemas';
import {
  JobsDataAccessService,
  NotesDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  createJobsDataAccessMock,
  createNotesDataAccessMock,
} from '@job-tracker-lite-angular/testing';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { vi } from 'vitest';
import { NotesTabComponent } from './notes-tab.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { NotesTabHarness } from './notes-tab.harness';

describe('NotesTabComponent', () => {
  async function setup(notes: ContactDto[]) {
    const dialogMock = { open: vi.fn() };
    const jobsDataAccessMock = createJobsDataAccessMock({ notes });
    const notesDataAccessMock = createNotesDataAccessMock();

    await TestBed.configureTestingModule({
      imports: [NotesTabComponent, getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useValue: createNotificationServiceMock(),
        },
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        {
          provide: NotesDataAccessService,
          useValue: notesDataAccessMock,
        },
        { provide: HlmDialogService, useValue: dialogMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(NotesTabComponent);
    fixture.componentRef.setInput('jobId', '10');

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      NotesTabHarness,
    );

    return { fixture, harness, dialogMock };
  }

  it('should render notes tab header and add button', async () => {
    const { harness } = await setup([]);

    expect(await harness.getHeaderText()).toContain('Notes');
    expect(await harness.hasAddNoteButton()).toBe(true);
  });

  it('should open create dialog when Add Note clicked', async () => {
    const { harness, dialogMock } = await setup([]);

    await harness.clickAddNote();

    expect(dialogMock.open).toHaveBeenCalled();
  });
});
