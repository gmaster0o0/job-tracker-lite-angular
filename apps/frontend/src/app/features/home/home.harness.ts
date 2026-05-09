import { ComponentHarness } from '@angular/cdk/testing';
import { HomeCardHarness } from './home-card/home-card.harness';

export class HomeHarness extends ComponentHarness {
  static hostSelector = 'app-home';

  private readonly welcomeHeadingLocator = this.locatorFor('h1');
  private readonly welcomeDescriptionLocator = this.locatorForOptional('p');
  private readonly homeCardHarnessesLocator =
    this.locatorForAll(HomeCardHarness);

  async getWelcomeHeading(): Promise<string> {
    const heading = await this.welcomeHeadingLocator();
    return heading.text();
  }

  async getWelcomeDescription(): Promise<string | null> {
    const description = await this.welcomeDescriptionLocator();
    return description ? description.text() : null;
  }

  async getHomeCardCount(): Promise<number> {
    const cards = await this.homeCardHarnessesLocator();
    return cards.length;
  }

  async getHomeCards(): Promise<HomeCardHarness[]> {
    return this.homeCardHarnessesLocator();
  }

  async getCardByTitle(title: string): Promise<HomeCardHarness | null> {
    const cards = await this.getHomeCards();
    const titles = await Promise.all(cards.map((c) => c.getTitle()));
    const index = titles.indexOf(title);
    return index !== -1 ? cards[index] : null;
  }
}
