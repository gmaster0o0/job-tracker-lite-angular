import { MockRoute } from '../registry';
import {
  CreateContactDto,
  UpdateContactDto,
} from '@job-tracker-lite-angular/schemas';
import { createId } from '@paralleldrive/cuid2';

export const contactsRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/api\/jobs\/(?<jobId>[^/]+)\/contacts$/,
    resolve: ({ state, params, scenarios }) => {
      if (scenarios.contacts === 'serverError') {
        return { status: 500, body: { message: 'Server error' } };
      }
      if (scenarios.contacts === 'notFound') {
        // returning 404 for a job's contacts
        return { status: 404, body: { message: 'Job not found' } };
      }
      // Assuming state.contacts contains all contacts, filter by jobId
      const contacts = state.contacts.filter(
        (c) => c.jobId === params['jobId'],
      );
      return { status: 200, body: contacts };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/jobs\/(?<jobId>[^/]+)\/contacts$/,
    resolve: ({ state, params, body }) => {
      const created = {
        ...(body as CreateContactDto),
        id: createId(),
        jobId: params['jobId'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.contacts.push(created as any);
      return { status: 201, body: created };
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/api\/jobs\/(?<jobId>[^/]+)\/contacts\/(?<contactId>[^/]+)$/,
    resolve: ({ state, params, body, scenarios }) => {
      if (scenarios.contacts === 'notFound') {
        return { status: 404, body: { message: 'Contact not found' } };
      }
      const contactIdx = state.contacts.findIndex(
        (c) => c.id === params['contactId'],
      );
      if (contactIdx === -1) {
        return { status: 404, body: { message: 'Contact not found' } };
      }
      const updated = {
        ...state.contacts[contactIdx],
        ...(body as UpdateContactDto),
        updatedAt: new Date().toISOString(),
      };
      state.contacts[contactIdx] = updated;
      return { status: 200, body: updated };
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/jobs\/(?<jobId>[^/]+)\/contacts\/(?<contactId>[^/]+)$/,
    resolve: ({ state, params, scenarios }) => {
      if (scenarios.contacts === 'notFound') {
        return { status: 404, body: { message: 'Contact not found' } };
      }
      const contactIdx = state.contacts.findIndex(
        (c) => c.id === params['contactId'],
      );
      if (contactIdx === -1) {
        return { status: 404, body: { message: 'Contact not found' } };
      }
      state.contacts.splice(contactIdx, 1);
      return { status: 200, body: { success: true } };
    },
  },
];
