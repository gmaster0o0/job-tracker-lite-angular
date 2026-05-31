import { ComponentHarness } from '@angular/cdk/testing';

export class HeroHarness extends ComponentHarness {
  static hostSelector = 'app-hero';

  private readonly titleLocator = this.locatorFor('h1');
  private readonly subtitleLocator = this.locatorFor(
    '[data-testid="hero-subtitle"]',
  );
  private readonly registerLinkLocator = this.locatorFor(
    '[data-testid="hero-register-link"]',
  );
  private readonly loginLinkLocator = this.locatorFor(
    '[data-testid="hero-login-link"]',
  );
  private readonly featureCardLocator = this.locatorForAll('article[hlmCard]');

  async getTitle(): Promise<string> {
    const title = await this.titleLocator();
    return title.text();
  }

  async getSubtitle(): Promise<string> {
    const subtitle = await this.subtitleLocator();
    return subtitle.text();
  }

  async getRegisterLink(): Promise<string | null> {
    const link = await this.registerLinkLocator();
    return link.getAttribute('href');
  }

  async getLoginLink(): Promise<string | null> {
    const link = await this.loginLinkLocator();
    return link.getAttribute('href');
  }

  async getFeatureCardCount(): Promise<number> {
    const cards = await this.featureCardLocator();
    return cards.length;
  }

  async hasComingSoonBadge(): Promise<boolean> {
    const badge = await this.locatorForOptional(
      '[data-testid="hero-feature-coming-soon"]',
    )();
    return Boolean(badge);
  }
}
