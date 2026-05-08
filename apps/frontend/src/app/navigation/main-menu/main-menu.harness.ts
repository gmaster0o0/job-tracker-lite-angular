import { ComponentHarness } from '@angular/cdk/testing';

export class MainMenuHarness extends ComponentHarness {
  static hostSelector = 'app-main-menu';

  private readonly getLinks = this.locatorForAll('a[href]');

  async getLinkCount(): Promise<number> {
    const links = await this.getLinks();
    return links.length;
  }

  async getLinkLabels(): Promise<string[]> {
    const links = await this.getLinks();
    return Promise.all(
      links.map(async (link) => {
        const text = await link.text();
        return text.replace(/\s+/g, ' ').trim();
      }),
    );
  }

  async hasLinkTo(path: string): Promise<boolean> {
    const links = await this.getLinks();
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href === path) {
        return true;
      }
    }
    return false;
  }
}
