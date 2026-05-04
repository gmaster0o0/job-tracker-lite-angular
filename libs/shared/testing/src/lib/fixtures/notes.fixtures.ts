import {
  NoteDto,
  CreateNoteDto,
  UpdateNoteDto,
} from '@job-tracker-lite-angular/api-interfaces';

export interface NoteFixturesMap {
  janeDoe: NoteDto;
  johnDoe: NoteDto;
  updatedNote: NoteDto;
}

export const noteFixtures: NoteFixturesMap = {
  janeDoe: {
    id: 1,
    jobId: 10,
    content: 'Jane Doe note content',
    createdAt: '2026-04-29T09:00:00.000Z',
    updatedAt: '2026-04-29T09:00:00.000Z',
  } as NoteDto,
  johnDoe: {
    id: 2,
    jobId: 10,
    content: 'John Doe note content',
    createdAt: '2026-04-29T09:00:00.000Z',
    updatedAt: '2026-04-29T09:00:00.000Z',
  },
  updatedNote: {
    id: 2,
    jobId: 10,
    content: 'Updated note content',
    createdAt: '2026-04-29T09:00:00.000Z',
    updatedAt: '2026-04-29T09:00:00.000Z',
  } as NoteDto,
};

export interface CreateNoteFixturesMap {
  janeDoe: CreateNoteDto;
  johnDoe: CreateNoteDto;
}

export const createNoteFixtures: CreateNoteFixturesMap = {
  janeDoe: {
    content: 'Jane Doe note content',
  },
  johnDoe: {
    content: 'John Doe note content',
  },
};

export interface UpdateNoteFixturesMap {
  updatedNote: UpdateNoteDto;
}

export const updateNoteFixtures: UpdateNoteFixturesMap = {
  updatedNote: {
    content: 'Updated note content',
  },
};
