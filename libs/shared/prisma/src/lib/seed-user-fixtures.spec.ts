import { toSlug } from '@job-tracker-lite-angular/core-utils';
import {
  seedUserFixtureList,
  seedUserFixtures,
} from '@job-tracker-lite-angular/testing';

describe('seedUserFixtures', () => {
  it.each(seedUserFixtureList)(
    'slug for $name matches toSlug(name)',
    ({ name, slug }) => {
      expect(slug).toBe(toSlug(name));
    },
  );

  it('has a unique slug per user', () => {
    const slugs = seedUserFixtureList.map((user) => user.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has a unique id per user', () => {
    const ids = seedUserFixtureList.map((user) => user.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a unique email per user', () => {
    const emails = seedUserFixtureList.map((user) => user.email);

    expect(new Set(emails).size).toBe(emails.length);
  });

  it('lists every fixture exactly once', () => {
    expect(seedUserFixtureList).toEqual([
      seedUserFixtures.demo,
      seedUserFixtures.recruiter,
      seedUserFixtures.moderator,
    ]);
  });
});
