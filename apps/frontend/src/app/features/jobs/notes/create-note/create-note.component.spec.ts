import { createNotificationServiceMock } from '@job-tracker-lite-angular/testing';
import { NotificationService } from '@job-tracker-lite-angular/frontend-data-access';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import {
  NotesDataAccessService,
  BackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  noteFixtures,
  createNoteFixtures,
  createNotesDataAccessMock,
  createBrnDialogRefMock,
} from '@job-tracker-lite-angular/testing';
import { vi } from 'vitest';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { CreateNoteComponent } from './create-note.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { CreateNoteHarness } from './create-note.harness';

describe('CreateNoteComponent', () => {
  let fixture: ComponentFixture<CreateNoteComponent>;
  let harness: CreateNoteHarness;
  let notesDataAccessMock: ReturnType<typeof createNotesDataAccessMock>;
  let notificationMock: ReturnType<typeof createNotificationServiceMock>;

  beforeEach(async () => {
    notesDataAccessMock = createNotesDataAccessMock();
    notificationMock = createNotificationServiceMock();
    vi.spyOn(notificationMock, 'success');

    await TestBed.configureTestingModule({
      imports: [CreateNoteComponent, getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useValue: notificationMock,
        },
        { provide: NotesDataAccessService, useValue: notesDataAccessMock },
        {
          provide: DIALOG_DATA,
          useValue: { jobId: 'test-job-id' },
        },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateNoteComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateNoteHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });

  it('should keep submit disabled while form is invalid', async () => {
    expect(await harness.isSubmitDisabled()).toBe(true);
  });

  it('should submit and create note', async () => {
    const createNote = vi.fn().mockResolvedValue(noteFixtures.janeDoe);
    notesDataAccessMock.createNote = createNote;

    await harness.fillForm(createNoteFixtures.janeDoe);
    await harness.submit();

    expect(createNote).toHaveBeenCalledWith(
      'test-job-id',
      createNoteFixtures.janeDoe,
    );
    expect(notificationMock.success).toHaveBeenCalledWith(
      'Note created successfully.',
    );
  });

  it('should not submit if form invalid', async () => {
    const createNote = vi.fn();
    notesDataAccessMock.createNote = createNote;

    await harness.fillForm(createNoteFixtures.allEmpty);
    await harness.submit();

    expect(await harness.getTitleErrorText()).toBeTruthy();
    expect(await harness.getBodyErrorText()).toBeTruthy();
    expect(createNote).not.toHaveBeenCalled();
  });

  it('should show validation error message if title is missing', async () => {
    const createNote = vi.fn();
    notesDataAccessMock.createNote = createNote;

    await harness.fillForm(createNoteFixtures.missingTitle);
    await harness.submit();

    expect(await harness.getTitleErrorText()).toContain('Title is required.');
    expect(createNote).not.toHaveBeenCalled();
  });

  it('should show validation error message if body is missing', async () => {
    const createNote = vi.fn();
    notesDataAccessMock.createNote = createNote;

    await harness.fillForm(createNoteFixtures.missingBody);
    await harness.submit();

    expect(await harness.getBodyErrorText()).toContain('Body is required.');
    expect(createNote).not.toHaveBeenCalled();
  });

  it('should set submit error on failure', async () => {
    const backendError = Object.assign(new Error('Backend error: not_unique'), {
      errorCode: 'not_unique',
      statusCode: 409,
    }) as BackendError;

    const createNote = vi.fn().mockRejectedValue(backendError);
    notesDataAccessMock.createNote = createNote;

    await harness.fillForm(createNoteFixtures.janeDoe);
    await harness.submit();

    expect(await harness.isErrorVisible()).toBe(true);
    expect(await harness.getErrorText()).toBeTruthy();
  });
});
