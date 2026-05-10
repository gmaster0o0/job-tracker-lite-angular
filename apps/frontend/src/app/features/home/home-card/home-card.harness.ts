import { ComponentHarness } from '@angular/cdk/testing';

export class HomeCardHarness extends ComponentHarness {
  static hostSelector = 'app-home-card';

  private readonly cardLinkLocator = this.locatorFor('a[hlmCard]');
  private readonly titleElementLocator = this.locatorFor('[hlmCardTitle]');
  private readonly descriptionElementLocator = this.locatorFor(
    '[hlmCardDescription]',
  );
  private readonly iconContainerLocator = this.locatorFor(
    'div[class*="rounded-lg"]',
  );

  async getTitle(): Promise<string> {
    const title = await this.titleElementLocator();
    return title.text();
  }

  async getDescription(): Promise<string> {
    const description = await this.descriptionElementLocator();
    return description.text();
  }

  async clickCard(): Promise<void> {
    const link = await this.cardLinkLocator();
    await link.click();
  }

  async getCardLink(): Promise<string | null> {
    const link = await this.cardLinkLocator();
    return link.getAttribute('href');
  }

  async getIconBackgroundClass(): Promise<string | null> {
    const iconContainer = await this.iconContainerLocator();
    return iconContainer.getAttribute('class');
  }

  async hasIcon(): Promise<boolean> {
    const iconContainer = await this.iconContainerLocator();
    const content = await iconContainer.getProperty('innerHTML');
    return content.trim().length > 0;
  }
}
