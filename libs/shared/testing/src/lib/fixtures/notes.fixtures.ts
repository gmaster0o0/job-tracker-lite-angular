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
    title: 'Jane Doe note title',
    body: 'Jane Doe note body',
    createdAt: '2026-04-29T09:00:00.000Z',
    updatedAt: '2026-04-29T09:00:00.000Z',
  },
  johnDoe: {
    id: 2,
    jobId: 10,
    title: 'John Doe note title',
    body: 'John Doe note body',
    createdAt: '2026-04-29T09:00:00.000Z',
    updatedAt: '2026-04-29T09:00:00.000Z',
  },
  updatedNote: {
    id: 2,
    jobId: 10,
    title: 'Updated note title',
    body: 'Updated note body',
    createdAt: '2026-04-29T09:00:00.000Z',
    updatedAt: '2026-04-29T09:00:00.000Z',
  },
};

export interface CreateNoteFixturesMap {
  janeDoe: CreateNoteDto;
  johnDoe: CreateNoteDto;
}

export const createNoteFixtures: CreateNoteFixturesMap = {
  janeDoe: {
    title: 'Jane Doe note title',
    body: 'Jane Doe note body',
  },
  johnDoe: {
    title: 'John Doe note title',
    body: 'John Doe note body',
  },
};

export interface UpdateNoteFixturesMap {
  updatedNote: UpdateNoteDto;
}

export const updateNoteFixtures: UpdateNoteFixturesMap = {
  updatedNote: {
    title: 'Updated note title',
    body: 'Updated note body',
  },
};
