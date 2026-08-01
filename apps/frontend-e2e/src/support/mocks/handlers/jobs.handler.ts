import { MockRoute } from '../registry';
import { CreateJobDto } from '@job-tracker-lite-angular/schemas';
import { jobFixtureTimestamp } from '@job-tracker-lite-angular/testing';
import { createId } from '@paralleldrive/cuid2';

export const jobsRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/api\/jobs$/,
    resolve: ({ state, scenarios }) => {
      if (scenarios.jobs === 'serverError') {
        return { status: 500, body: { message: 'Server error' } };
      }
      return { status: 200, body: state.jobs };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/jobs$/,
    resolve: ({ state, body }) => {
      const created = {
        ...(body as CreateJobDto),
        id: createId(),
        createdAt: new Date(jobFixtureTimestamp).toISOString(),
        updatedAt: new Date(jobFixtureTimestamp).toISOString(),
      };
      state.jobs.unshift(created);
      return { status: 201, body: created };
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/api\/jobs\/(?<id>[^/]+)\/status$/,
    resolve: ({ state, params, body, scenarios }) => {
      if (scenarios.jobs === 'notFound') {
        return { status: 404, body: { message: 'Job not found' } };
      }
      const jobIdx = state.jobs.findIndex((j) => j.id === params['id']);
      if (jobIdx === -1) {
        return { status: 404, body: { message: 'Job not found' } };
      }
      const updated = {
        ...state.jobs[jobIdx],
        status: (body as { status: any }).status,
        updatedAt: new Date().toISOString(),
      };
      state.jobs[jobIdx] = updated;
      return { status: 200, body: updated };
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/api\/jobs\/(?<id>[^/]+)$/,
    resolve: ({ state, params, body, scenarios }) => {
      if (scenarios.jobs === 'notFound') {
        return { status: 404, body: { message: 'Job not found' } };
      }
      const jobIdx = state.jobs.findIndex((j) => j.id === params['id']);
      if (jobIdx === -1) {
        return { status: 404, body: { message: 'Job not found' } };
      }
      const updated = {
        ...state.jobs[jobIdx],
        ...(body as any),
        updatedAt: new Date().toISOString(),
      };
      state.jobs[jobIdx] = updated;
      return { status: 200, body: updated };
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/jobs\/(?<id>[^/]+)$/,
    resolve: ({ state, params, scenarios }) => {
      if (scenarios.jobs === 'notFound') {
        return { status: 404, body: { message: 'Job not found' } };
      }
      const jobIdx = state.jobs.findIndex((j) => j.id === params['id']);
      if (jobIdx === -1) {
        return { status: 404, body: { message: 'Job not found' } };
      }
      state.jobs.splice(jobIdx, 1);
      return { status: 200, body: { success: true } }; // Assuming returns success or empty
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/jobs\/(?<id>[^/]+)$/,
    resolve: ({ state, params, scenarios }) => {
      if (scenarios.jobs === 'notFound') {
        return { status: 404, body: { message: 'Job not found' } };
      }
      const job = state.jobs.find((j) => j.id === params['id']);
      if (!job) {
        return { status: 404, body: { message: 'Job not found' } };
      }
      return { status: 200, body: job };
    },
  },
];
