import {
  NoteDto,
  CreateNoteDto,
  UpdateNoteDto,
} from '@job-tracker-lite-angular/api-interfaces';
import { noteFixtures, createNoteFixtures } from '../fixtures/notes.fixtures';

type ResourceState<T> = {
  value: () => T;
  isLoading: () => boolean;
  reload: () => void;
  error: () => unknown;
};

export type NotesDataAccessMockOptions = {
  notes?: NoteDto[];
  createNote?: (
    jobId: number,
    createNoteDto: CreateNoteDto,
  ) => Promise<NoteDto>;
  updateNote?: (
    jobId: number,
    noteId: number,
    updateNoteDto: UpdateNoteDto,
  ) => Promise<NoteDto>;
  deleteNote?: (jobId: number, noteId: number) => Promise<void>;
};

export function createNotesDataAccessMock(
  options: NotesDataAccessMockOptions = {},
) {
  const notes = options.notes ?? [];

  const notesResource: ResourceState<NoteDto[]> = {
    value: () => notes,
    isLoading: () => false,
    reload: () => undefined,
    error: () => null,
  };

  return {
    getNotesResource: () => notesResource,
    notesResource,
    selectJob: () => {
      /*empty*/
    },
    createNote: options.createNote ?? (async () => noteFixtures.janeDoe),
    updateNote: options.updateNote ?? (async () => noteFixtures.updatedNote),
    deleteNote: options.deleteNote ?? (async () => undefined),
    __fixtures: {
      createNote: createNoteFixtures,
      notes,
    },
  };
}
