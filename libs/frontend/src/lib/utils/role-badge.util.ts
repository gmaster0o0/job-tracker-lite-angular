import { UserListItemDto } from '@job-tracker-lite-angular/schemas';

export const ROLE_BADGE_CLASSES: Record<UserListItemDto['role'], string> = {
  ADMIN: 'bg-primary text-primary-foreground',
  MODERATOR: 'bg-blue-600 text-white',
  RECRUITER: 'bg-emerald-600 text-white',
  USER: 'bg-secondary text-secondary-foreground',
};
