import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import {
  NotesDataAccessService,
  BackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import { vi } from 'vitest';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import {
  createBrnDialogRefMock,
  createNotesDataAccessMock,
  noteFixtures,
  updateNoteFixtures,
} from '@job-tracker-lite-angular/testing';
import { EditNoteComponent } from './edit-note.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { EditNoteHarness } from './edit-note.harness';

describe('EditNoteComponent', () => {
  let fixture: ComponentFixture<EditNoteComponent>;
  let harness: EditNoteHarness;
  let notesDataAccessMock: ReturnType<typeof createNotesDataAccessMock>;

  beforeEach(async () => {
    notesDataAccessMock = createNotesDataAccessMock();

    await TestBed.configureTestingModule({
      imports: [EditNoteComponent, getTranslocoModule()],
      providers: [
        { provide: NotesDataAccessService, useValue: notesDataAccessMock },
        {
          provide: DIALOG_DATA,
          useValue: {
            jobId: 'test-job-id',
            note: noteFixtures.janeDoe,
          },
        },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditNoteComponent);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditNoteHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });

  it('should initialize form with note data', async () => {
    expect(await harness.getTitleValue()).toBe(noteFixtures.janeDoe.title);
    expect(await harness.getBodyValue()).toBe(noteFixtures.janeDoe.body);
  });

  it('should submit and call update', async () => {
    const updateNote = vi.fn().mockResolvedValue(noteFixtures.updatedNote);
    notesDataAccessMock.updateNote = updateNote;

    await harness.fillForm(updateNoteFixtures.updatedNote);
    await harness.submit();

    expect(updateNote).toHaveBeenCalledWith(
      'test-job-id',
      noteFixtures.janeDoe.id,
      updateNoteFixtures.updatedNote,
    );
  });

  it('should not submit if form invalid', async () => {
    const updateNote = vi.fn();
    notesDataAccessMock.updateNote = updateNote;

    await harness.fillForm(updateNoteFixtures.allEmpty);
    await harness.submit();
    fixture.detectChanges();

    expect(await harness.getTitleErrorText()).toBeTruthy();
    expect(await harness.getBodyErrorText()).toBeTruthy();
    expect(updateNote).not.toHaveBeenCalled();
  });

  it('should show validation error message if title is missing', async () => {
    const updateNote = vi.fn();
    notesDataAccessMock.updateNote = updateNote;

    await harness.fillForm(updateNoteFixtures.missingTitle);
    await harness.submit();
    fixture.detectChanges();

    expect(await harness.getTitleErrorText()).toContain('Title is required.');
    expect(updateNote).not.toHaveBeenCalled();
  });

  it('should show validation error message if body is missing', async () => {
    const updateNote = vi.fn();
    notesDataAccessMock.updateNote = updateNote;

    await harness.fillForm(updateNoteFixtures.missingBody);
    await harness.submit();
    fixture.detectChanges();

    expect(await harness.getBodyErrorText()).toContain('Body is required.');
    expect(updateNote).not.toHaveBeenCalled();
  });

  it('should set submit error on failure', async () => {
    const backendError = Object.assign(new Error('Backend error: not_unique'), {
      errorCode: 'not_unique',
      statusCode: 409,
    }) as BackendError;

    const updateNote = vi.fn().mockRejectedValue(backendError);
    notesDataAccessMock.updateNote = updateNote;

    await harness.fillForm(updateNoteFixtures.updatedNote);
    await harness.submit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(await harness.isErrorVisible()).toBe(true);
    expect(await harness.getErrorText()).toBeTruthy();
  });
});
