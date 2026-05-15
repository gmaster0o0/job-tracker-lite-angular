import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { NotesDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { vi } from 'vitest';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { createBrnDialogRefMock } from '@job-tracker-lite-angular/testing';
import { EditNoteComponent } from './edit-note.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { EditNoteComponentHarness } from './edit-note.harness';
import { UpdateNoteDto } from '@job-tracker-lite-angular/schemas';
import {
  noteFixtures,
  updateNoteFixtures,
} from '@job-tracker-lite-angular/testing';

describe('EditNoteComponent', () => {
  let harness: EditNoteComponentHarness;
  let updateNote: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    updateNote = vi.fn().mockResolvedValue(noteFixtures.updatedNote);

    await TestBed.configureTestingModule({
      imports: [EditNoteComponent, getTranslocoModule()],
      providers: [
        { provide: NotesDataAccessService, useValue: { updateNote } },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditNoteComponent);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditNoteComponentHarness,
    );
  });

  it('should submit and call update', async () => {
    await harness.fillForm(updateNoteFixtures.updatedNote);
    await harness.submit();

    expect(updateNote).toHaveBeenCalledWith(
      0,
      0,
      updateNoteFixtures.updatedNote as UpdateNoteDto,
    );
  });
});
