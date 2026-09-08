import { MockRoute } from '../registry';
import {
  CreateNoteDto,
  UpdateNoteDto,
} from '@job-tracker-lite-angular/schemas';
import { createId } from '@paralleldrive/cuid2';

export const notesRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/api\/jobs\/(?<jobId>[^/]+)\/notes$/,
    resolve: ({ state, params, scenarios }) => {
      if (scenarios.notes === 'serverError') {
        return { status: 500, body: { message: 'Server error' } };
      }
      if (scenarios.notes === 'notFound') {
        return { status: 404, body: { message: 'Job not found' } };
      }
      const notes = state.notes.filter((n) => n.jobId === params['jobId']);
      return { status: 200, body: notes };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/jobs\/(?<jobId>[^/]+)\/notes$/,
    resolve: ({ state, params, body }) => {
      const created = {
        ...(body as CreateNoteDto),
        id: createId(),
        jobId: params['jobId'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.notes.push(created as any);
      return { status: 201, body: created };
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/api\/jobs\/(?<jobId>[^/]+)\/notes\/(?<noteId>[^/]+)$/,
    resolve: ({ state, params, body, scenarios }) => {
      if (scenarios.notes === 'notFound') {
        return { status: 404, body: { message: 'Note not found' } };
      }
      const noteIdx = state.notes.findIndex((n) => n.id === params['noteId']);
      if (noteIdx === -1) {
        return { status: 404, body: { message: 'Note not found' } };
      }
      const updated = {
        ...state.notes[noteIdx],
        ...(body as UpdateNoteDto),
        updatedAt: new Date().toISOString(),
      };
      state.notes[noteIdx] = updated;
      return { status: 200, body: updated };
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/jobs\/(?<jobId>[^/]+)\/notes\/(?<noteId>[^/]+)$/,
    resolve: ({ state, params, scenarios }) => {
      if (scenarios.notes === 'notFound') {
        return { status: 404, body: { message: 'Note not found' } };
      }
      const noteIdx = state.notes.findIndex((n) => n.id === params['noteId']);
      if (noteIdx === -1) {
        return { status: 404, body: { message: 'Note not found' } };
      }
      state.notes.splice(noteIdx, 1);
      return { status: 200, body: { success: true } };
    },
  },
];
