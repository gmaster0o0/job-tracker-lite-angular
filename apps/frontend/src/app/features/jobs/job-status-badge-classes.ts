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
