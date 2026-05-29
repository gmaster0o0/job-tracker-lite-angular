import { Test } from '@nestjs/testing';

import { NotesController } from './notes.controller';
import { JobsService } from './jobs.service';
import {
  authSessionFixtures,
  noteFixtures,
  createNoteFixtures,
  updateNoteFixtures,
  createJobsServiceMock,
} from '@job-tracker-lite-angular/testing';

describe('NotesController', () => {
  let notesController: NotesController;
  let jobsService: any;

  beforeEach(async () => {
    jobsService = createJobsServiceMock(jest.fn);

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

    await expect(
      notesController.findNotes(
        authSessionFixtures.authenticated as never,
        '10',
      ),
    ).resolves.toEqual([noteFixtures.johnDoe]);
  });

  it('should delegate note creation to the service', async () => {
    jobsService.createNote.mockResolvedValue(noteFixtures.johnDoe);

    await expect(
      notesController.createNote(
        authSessionFixtures.authenticated as never,
        '10',
        createNoteFixtures.johnDoe,
      ),
    ).resolves.toEqual(noteFixtures.johnDoe);
  });

  it('should delegate note update to the service', async () => {
    jobsService.updateNote.mockResolvedValue(noteFixtures.updatedNote);

    await expect(
      notesController.updateNote(
        authSessionFixtures.authenticated as never,
        '10',
        '2',
        updateNoteFixtures.updatedNote,
      ),
    ).resolves.toEqual(noteFixtures.updatedNote);
  });

  it('should delegate note deletion to the service', async () => {
    jobsService.deleteNote.mockResolvedValue(undefined);
    await expect(
      notesController.deleteNote(
        authSessionFixtures.authenticated as never,
        '10',
        '2',
      ),
    ).resolves.toBeUndefined();
  });
});
