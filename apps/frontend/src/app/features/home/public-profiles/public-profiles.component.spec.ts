import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { PublicProfilesComponent } from './public-profiles.component';
import { PublicProfilesHarness } from './public-profiles.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { homeLandingFixtures } from '@job-tracker-lite-angular/testing';

describe('PublicProfilesComponent', () => {
  let harness: PublicProfilesHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicProfilesComponent, getTranslocoModule()],
    }).compileComponents();

    const fixture = TestBed.createComponent(PublicProfilesComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      PublicProfilesHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });

  it('should render title and subtitle', async () => {
    expect(await harness.getTitle()).toBe(
      homeLandingFixtures.publicProfiles.title,
    );
    expect(await harness.getSubtitle()).toBe(
      homeLandingFixtures.publicProfiles.subtitle,
    );
  });

  it('should render all profile names', async () => {
    expect(await harness.getProfileNames()).toEqual(
      homeLandingFixtures.publicProfiles.profiles.map(
        (profile) => profile.name,
      ),
    );
  });

  it('should render profile links', async () => {
    expect(await harness.getLinkedInLinks()).toEqual(
      homeLandingFixtures.publicProfiles.profiles.map(
        (profile) => profile.linkedInUrl,
      ),
    );
    expect(await harness.getGithubLinks()).toEqual(
      homeLandingFixtures.publicProfiles.profiles.map(
        (profile) => profile.githubUrl,
      ),
    );
  });
});
