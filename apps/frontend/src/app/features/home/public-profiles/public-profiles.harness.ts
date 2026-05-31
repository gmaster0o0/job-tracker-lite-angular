import { ComponentHarness } from '@angular/cdk/testing';

export class PublicProfilesHarness extends ComponentHarness {
  static hostSelector = 'app-public-profiles';

  private readonly titleLocator = this.locatorFor('h2');
  private readonly subtitleLocator = this.locatorFor('p');
  private readonly profileNameLocators = this.locatorForAll(
    '[data-testid="public-profile-name"]',
  );
  private readonly linkedInLocators = this.locatorForAll(
    '[data-testid="public-profile-linkedin"]',
  );
  private readonly githubLocators = this.locatorForAll(
    '[data-testid="public-profile-github"]',
  );

  async getTitle(): Promise<string> {
    const title = await this.titleLocator();
    return title.text();
  }

  async getSubtitle(): Promise<string> {
    const subtitle = await this.subtitleLocator();
    return subtitle.text();
  }

  async getProfileNames(): Promise<string[]> {
    const names = await this.profileNameLocators();
    return Promise.all(names.map((name) => name.text()));
  }

  async getLinkedInLinks(): Promise<Array<string | null>> {
    const links = await this.linkedInLocators();
    return Promise.all(links.map((link) => link.getAttribute('href')));
  }

  async getGithubLinks(): Promise<Array<string | null>> {
    const links = await this.githubLocators();
    return Promise.all(links.map((link) => link.getAttribute('href')));
  }
}
