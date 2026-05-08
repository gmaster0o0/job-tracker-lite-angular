import { ComponentHarness } from '@angular/cdk/testing';

export class JobOverviewHarness extends ComponentHarness {
  static hostSelector = 'app-job-overview';

  private readonly getArticle = this.locatorFor('article');

  async getArticleHtml(): Promise<string> {
    const article = await this.getArticle();
    return article.getProperty('innerHTML');
  }

  async getTextContent(): Promise<string> {
    const host = await this.host();
    return host.text();
  }
}
