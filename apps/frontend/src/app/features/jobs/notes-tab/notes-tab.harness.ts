import { ComponentHarness } from '@angular/cdk/testing';

export class NotesTabHarness extends ComponentHarness {
  static hostSelector = 'app-notes-tab';

  private readonly getHeader = this.locatorFor('h2');
  private readonly getAddNoteButton = this.locatorFor('button[type="button"]');

  async getHeaderText(): Promise<string> {
    const header = await this.getHeader();
    return header.text();
  }

  async hasAddNoteButton(): Promise<boolean> {
    const button = await this.getAddNoteButton();
    return !!button;
  }

  async clickAddNote(): Promise<void> {
    const button = await this.getAddNoteButton();
    await button.click();
  }
}
