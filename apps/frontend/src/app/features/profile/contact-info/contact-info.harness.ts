import { ComponentHarness } from '@angular/cdk/testing';
import { InlineInputHarness } from '../../../shared/inline-edit/input/input.harness';

export class ContactInfoHarness extends ComponentHarness {
  static hostSelector = 'app-contact-info';

  private readonly emailInputLocator = this.locatorFor(
    InlineInputHarness.with({ id: 'email' }),
  );
  private readonly linkedinInputLocator = this.locatorFor(
    InlineInputHarness.with({ id: 'linkedin' }),
  );
  private readonly githubInputLocator = this.locatorFor(
    InlineInputHarness.with({ id: 'github' }),
  );
  private readonly websiteInputLocator = this.locatorFor(
    InlineInputHarness.with({ id: 'website' }),
  );
  private readonly buttonsLocator = this.locatorForAll('button');
  private readonly editButtonLocator = this.locatorFor(
    'app-edit-button button',
  );

  async getEmail(): Promise<string> {
    const input = await this.emailInputLocator();
    return input.getValue();
  }

  async setEmail(value: string): Promise<void> {
    const input = await this.emailInputLocator();
    await input.setValue(value);
  }

  async getLinkedin(): Promise<string> {
    const input = await this.linkedinInputLocator();
    return input.getValue();
  }

  async setLinkedin(value: string): Promise<void> {
    const input = await this.linkedinInputLocator();
    await input.setValue(value);
  }

  async getGithub(): Promise<string> {
    const input = await this.githubInputLocator();
    return input.getValue();
  }

  async setGithub(value: string): Promise<void> {
    const input = await this.githubInputLocator();
    await input.setValue(value);
  }

  async getWebsite(): Promise<string> {
    const input = await this.websiteInputLocator();
    return input.getValue();
  }

  async setWebsite(value: string): Promise<void> {
    const input = await this.websiteInputLocator();
    await input.setValue(value);
  }

  async isEditDisabled(): Promise<boolean> {
    const button = await this.editButtonLocator();
    return button.getProperty('disabled');
  }

  async clickEdit(): Promise<void> {
    const buttons = await this.buttonsLocator();
    for (const button of buttons) {
      const text = await button.text();
      if (text.toLowerCase().includes('edit')) {
        return button.click();
      }
    }
    throw new Error('Edit button not found');
  }

  async clickSave(): Promise<void> {
    const buttons = await this.buttonsLocator();
    for (const button of buttons) {
      const text = await button.text();
      if (text.toLowerCase().includes('save')) {
        return button.click();
      }
    }
    throw new Error('Save button not found');
  }

  async clickCancel(): Promise<void> {
    const buttons = await this.buttonsLocator();
    for (const button of buttons) {
      const text = await button.text();
      if (text.toLowerCase().includes('cancel')) {
        return button.click();
      }
    }
    throw new Error('Cancel button not found');
  }
}
