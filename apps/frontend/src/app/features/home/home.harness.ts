import { ComponentHarness } from '@angular/cdk/testing';
import { HeroHarness } from './hero/hero.harness';
import { LandingDashboardHarness } from './landing-dashboard/landing-dashboard.harness';
import { PublicProfilesHarness } from './public-profiles/public-profiles.harness';

export class HomeHarness extends ComponentHarness {
  static hostSelector = 'app-home';

  private readonly heroHarnessLocator = this.locatorForOptional(HeroHarness);
  private readonly landingDashboardHarnessLocator = this.locatorForOptional(
    LandingDashboardHarness,
  );
  private readonly publicProfilesHarnessLocator = this.locatorForOptional(
    PublicProfilesHarness,
  );

  async hasHeroSection(): Promise<boolean> {
    const hero = await this.heroHarnessLocator();
    return Boolean(hero);
  }

  async hasLandingDashboard(): Promise<boolean> {
    const dashboard = await this.landingDashboardHarnessLocator();
    return Boolean(dashboard);
  }

  async hasPublicProfiles(): Promise<boolean> {
    const profiles = await this.publicProfilesHarnessLocator();
    return Boolean(profiles);
  }

  async getHeroHarness(): Promise<HeroHarness | null> {
    return this.heroHarnessLocator();
  }

  async getLandingDashboardHarness(): Promise<LandingDashboardHarness | null> {
    return this.landingDashboardHarnessLocator();
  }

  async getPublicProfilesHarness(): Promise<PublicProfilesHarness | null> {
    return this.publicProfilesHarnessLocator();
  }
}
