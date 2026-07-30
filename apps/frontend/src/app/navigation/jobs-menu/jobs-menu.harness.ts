import { ComponentHarness } from '@angular/cdk/testing';
import { JobCardHarness } from '../../features/jobs/job-card/job-card.harness';

export class JobsMenuHarness extends ComponentHarness {
  static hostSelector = 'app-jobs-menu';

  private readonly searchInput = this.locatorFor('input[type="search"]');
  private readonly jobCards = this.locatorForAll(JobCardHarness);

  async setSearchQuery(value: string): Promise<void> {
    const input = await this.searchInput();
    await input.setInputValue(value);
    await input.dispatchEvent('input');
  }

  async getJobCardCount(): Promise<number> {
    return (await this.jobCards()).length;
  }

  async getJobCardTexts(): Promise<string[]> {
    const cards = await this.jobCards();
    return Promise.all(cards.map((card) => card.getTextContent()));
  }
}
