import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { CreateNoteComponent } from './create-note.component';
import { NotesDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { createBrnDialogRefMock } from '@job-tracker-lite-angular/testing';
import { CreateNoteHarness } from './create-note.harness';

// use shared mock from libs/shared/testing

describe('CreateNoteComponent', () => {
  let harness: CreateNoteHarness;

  beforeEach(async () => {
    const notesDataAccessMock = {
      createNote: async () => ({ id: 1 }),
    };

    await TestBed.configureTestingModule({
      imports: [CreateNoteComponent],
      providers: [
        { provide: NotesDataAccessService, useValue: notesDataAccessMock },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateNoteComponent);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateNoteHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });
});
