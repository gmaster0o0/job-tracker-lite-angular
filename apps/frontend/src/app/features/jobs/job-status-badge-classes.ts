import { JobStatus, JobStatusDto } from '@job-tracker-lite-angular/schemas';

/**
 * Tinted badge classes per job status. Each one is a semantic accent token from
 * styles.scss, so the badges follow the active theme instead of being pinned to
 * the light palette.
 */
export const JOB_STATUS_BADGE_CLASSES: Record<JobStatusDto, string> = {
  [JobStatus.SAVED]: 'bg-info/10 text-info border-info/20',
  [JobStatus.APPLIED]: 'bg-warning/10 text-warning border-warning/20',
  [JobStatus.INTERVIEW]: 'bg-highlight/10 text-highlight border-highlight/20',
  [JobStatus.JOB_OFFERED]: 'bg-success/10 text-success border-success/20',
  [JobStatus.REJECTED]:
    'bg-destructive/10 text-destructive border-destructive/20',
};

/** Transloco keys for the human-readable label of each job status. */
export const JOB_STATUS_LABEL_KEYS: Record<JobStatusDto, string> = {
  [JobStatus.SAVED]: 'jobs.status.saved',
  [JobStatus.APPLIED]: 'jobs.status.applied',
  [JobStatus.INTERVIEW]: 'jobs.status.interview',
  [JobStatus.JOB_OFFERED]: 'jobs.status.offered',
  [JobStatus.REJECTED]: 'jobs.status.rejected',
};
