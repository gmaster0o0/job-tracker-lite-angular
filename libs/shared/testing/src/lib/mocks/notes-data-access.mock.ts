import {
  NoteDto,
  CreateNoteDto,
  UpdateNoteDto,
} from '@job-tracker-lite-angular/schemas';
import { noteFixtures, createNoteFixtures } from '../fixtures/notes.fixtures';
import { ResourceState } from './ResourceState';

export type NotesDataAccessMockOptions = {
  notes?: NoteDto[];
  createNote?: (
    jobId: string,
    createNoteDto: CreateNoteDto,
  ) => Promise<NoteDto>;
  updateNote?: (
    jobId: string,
    noteId: string,
    updateNoteDto: UpdateNoteDto,
  ) => Promise<NoteDto>;
  deleteNote?: (jobId: string, noteId: string) => Promise<void>;
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
