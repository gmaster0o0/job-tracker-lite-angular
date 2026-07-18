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
  async function setup(
    notes: ContactDto[],
    options?: {
      dialogMock?: { open: ReturnType<typeof vi.fn> };
      notesDataAccessMock?: ReturnType<typeof createNotesDataAccessMock>;
    },
  ) {
    const dialogMock = options?.dialogMock ?? { open: vi.fn() };
    const jobsDataAccessMock = createJobsDataAccessMock({ notes });
    const notesDataAccessMock =
      options?.notesDataAccessMock ?? createNotesDataAccessMock();
    const notificationMock = createNotificationServiceMock();
    vi.spyOn(notificationMock, 'success');

    await TestBed.configureTestingModule({
      imports: [NotesTabComponent, getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useValue: notificationMock,
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

    return { fixture, harness, dialogMock, notificationMock };
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

  it('should notify when note deletion is confirmed', async () => {
    const deleteNote = vi.fn().mockResolvedValue(undefined);
    const notesDataAccessMock = createNotesDataAccessMock();
    notesDataAccessMock.deleteNote = deleteNote as never;
    const dialogMock = { open: vi.fn() };
    const { fixture, notificationMock } = await setup([], {
      dialogMock,
      notesDataAccessMock,
    });

    const component = fixture.componentInstance as unknown as {
      openDeleteDialog: (note: unknown) => void;
    };
    const note = { id: 'note-1', title: 'Test note', body: 'Body' } as never;

    component.openDeleteDialog(note);

    const dialogConfig = dialogMock.open.mock.calls[0][1] as {
      context: { onConfirm: () => Promise<void> };
    };
    await dialogConfig.context.onConfirm();

    expect(deleteNote).toHaveBeenCalledWith('10', 'note-1');
    expect(notificationMock.success).toHaveBeenCalledWith(
      'Note deleted successfully.',
    );
  });
});
