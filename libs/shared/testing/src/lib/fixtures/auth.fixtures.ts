import { AuthSessionDto } from '@job-tracker-lite-angular/schemas';
import { UserListItemDto } from '@job-tracker-lite-angular/schemas';
import { UserFixture, userFixtureList, userFixtures } from './user.fixtures';

/**
 * Sessions and list rows are derived from `userFixtures` so a persona keeps one
 * identity everywhere. Add people there, not here.
 */
export const authUserIdFixture = userFixtures.admin.id;

/**
 * `slug` is a database concern that the session payload does not carry, so it
 * is dropped when a persona is projected onto an auth session.
 */
function sessionFor(
  user: UserFixture,
  overrides: Partial<UserFixture> = {},
): AuthSessionDto {
  const { slug: _slug, ...merged } = { ...user, ...overrides };

  return {
    user: merged,
    session: {
      id: `session_${merged.id}`,
      token: `token_${merged.id}`,
      expiresAt: new Date('2027-04-29T09:00:00.000Z'),
      createdAt: merged.createdAt,
      updatedAt: merged.updatedAt,
      ipAddress: null,
      userAgent: null,
      userId: merged.id,
    },
  };
}

export const authSessionFixtures: {
  authenticated: AuthSessionDto;
  pendingDeletion: AuthSessionDto;
  guest: AuthSessionDto;
  recruiter: AuthSessionDto;
  moderator: AuthSessionDto;
} = {
  authenticated: sessionFor(userFixtures.admin),
  pendingDeletion: sessionFor(userFixtures.admin, {
    status: 'PENDING_DELETION',
    role: 'USER',
  }),
  recruiter: sessionFor(userFixtures.recruiter),
  moderator: sessionFor(userFixtures.moderator),
  guest: null,
};

/** The personas keyed by role, for specs that only care about authorisation. */
export const userRoleFixtures = {
  admin: userFixtures.admin,
  moderator: userFixtures.moderator,
  recruiter: userFixtures.recruiter,
  user: userFixtures.basic,
};

export const userListFixtures: UserListItemDto[] = userFixtureList.map(
  ({ id, name, email, role }) => ({ id, name, email, role }),
);
