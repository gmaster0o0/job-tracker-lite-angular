import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeroComponent } from './hero.component';
import { HeroHarness } from './hero.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { homeLandingFixtures } from '@job-tracker-lite-angular/testing';

describe('HeroComponent', () => {
  let harness: HeroHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroComponent, getTranslocoModule()],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeroComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      HeroHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });

  it('should render hero heading and subtitle', async () => {
    expect(await harness.getTitle()).toBe(homeLandingFixtures.hero.title);
    expect(await harness.getSubtitle()).toBe(homeLandingFixtures.hero.subtitle);
  });

  it('should render login and register cta links', async () => {
    expect(await harness.getRegisterLink()).toBe(
      homeLandingFixtures.hero.registerCtaHref,
    );
    expect(await harness.getLoginLink()).toBe(
      homeLandingFixtures.hero.loginCtaHref,
    );
  });

  it('should render four feature cards and coming soon badge', async () => {
    expect(await harness.getFeatureCardCount()).toBe(
      homeLandingFixtures.hero.featureCardCount,
    );
    expect(await harness.hasComingSoonBadge()).toBe(true);
  });
});
