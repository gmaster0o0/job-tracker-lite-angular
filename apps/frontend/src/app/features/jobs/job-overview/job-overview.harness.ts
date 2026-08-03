import { ComponentHarness } from '@angular/cdk/testing';

export class JobOverviewHarness extends ComponentHarness {
  static hostSelector = 'app-job-overview';

  private readonly getArticle = this.locatorFor('article');
  private readonly getEditButton = this.locatorFor(
    '[data-testid="job-overview-edit"]',
  );

  async getArticleHtml(): Promise<string> {
    const article = await this.getArticle();
    return article.getProperty('innerHTML');
  }

  async getTextContent(): Promise<string> {
    const host = await this.host();
    return host.text();
  }

  async getEditTooltip(): Promise<string | null> {
    const button = await this.getEditButton();
    return button.getAttribute('aria-label');
  }

  async clickEdit(): Promise<void> {
    const button = await this.getEditButton();
    await button.click();
  }
}
