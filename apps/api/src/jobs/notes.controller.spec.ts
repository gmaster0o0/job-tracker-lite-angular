import { Test } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { JobsService } from './jobs.service';
import {
  noteFixtures,
  createNoteFixtures,
  updateNoteFixtures,
} from '@job-tracker-lite-angular/shared-testing';

describe('NotesController', () => {
  let notesController: NotesController;

  let jobsService: {
    findNotes: jest.Mock;
    createNote: jest.Mock;
    updateNote: jest.Mock;
    deleteNote: jest.Mock;
  };

  beforeEach(async () => {
    jobsService = {
      findNotes: jest.fn(),
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: JobsService,
          useValue: jobsService,
        },
      ],
    }).compile();

    notesController = moduleRef.get<NotesController>(NotesController);
  });

  it('should delegate note operations to the service', async () => {
    jobsService.findNotes.mockResolvedValue([noteFixtures.johnDoe]);

    await expect(notesController.findNotes(10)).resolves.toEqual([
      noteFixtures.johnDoe,
    ]);
  });

  it('should delegate note creation to the service', async () => {
    jobsService.createNote.mockResolvedValue(noteFixtures.johnDoe);

    await expect(
      notesController.createNote(10, createNoteFixtures.johnDoe),
    ).resolves.toEqual(noteFixtures.johnDoe);
  });

  it('should delegate note update to the service', async () => {
    jobsService.updateNote.mockResolvedValue(noteFixtures.updatedNote);

    await expect(
      notesController.updateNote(10, 2, updateNoteFixtures.updatedNote),
    ).resolves.toEqual(noteFixtures.updatedNote);
  });

  it('should delegate note deletion to the service', async () => {
    jobsService.deleteNote.mockResolvedValue(undefined);
    await expect(notesController.deleteNote(10, 2)).resolves.toBeUndefined();
  });
});
