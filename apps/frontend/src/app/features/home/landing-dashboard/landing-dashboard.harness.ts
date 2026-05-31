import { ComponentHarness } from '@angular/cdk/testing';
import { HomeCardHarness } from '../home-card/home-card.harness';

export class LandingDashboardHarness extends ComponentHarness {
  static hostSelector = 'app-landing-dashboard';

  private readonly headingLocator = this.locatorFor('h1');
  private readonly descriptionLocator = this.locatorFor('p');
  private readonly cardHarnessesLocator = this.locatorForAll(HomeCardHarness);

  async getHeading(): Promise<string> {
    const heading = await this.headingLocator();
    return heading.text();
  }

  async getDescription(): Promise<string> {
    const description = await this.descriptionLocator();
    return description.text();
  }

  async getHomeCardCount(): Promise<number> {
    const cards = await this.cardHarnessesLocator();
    return cards.length;
  }

  async getCardByTitle(title: string): Promise<HomeCardHarness | null> {
    const cards = await this.cardHarnessesLocator();
    const titles = await Promise.all(cards.map((card) => card.getTitle()));
    const index = titles.indexOf(title);
    return index >= 0 ? cards[index] : null;
  }
}
