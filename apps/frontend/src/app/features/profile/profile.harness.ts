import { ComponentHarness } from '@angular/cdk/testing';

export class ProfileHarness extends ComponentHarness {
  static hostSelector = 'app-profile';

  private getNameInput = this.locatorFor('input#name');
  private getTitleInput = this.locatorFor('input#title');
  private getCityInput = this.locatorFor('input#city');
  private getBioTextarea = this.locatorFor('textarea#bio');
  private getButtons = this.locatorForAll('button');

  async getName(): Promise<string> {
    const input = await this.getNameInput();
    return input.getProperty('value');
  }

  async setName(value: string): Promise<void> {
    const input = await this.getNameInput();
    await input.clear();
    await input.sendKeys(value);
    await input.blur();
  }

  async clickEditPersonal(): Promise<void> {
    const buttons = await this.getButtons();
    for (const button of buttons) {
      if ((await button.text()).includes('Edit')) {
        return button.click();
      }
    }
    throw new Error('Edit button not found');
  }

  async save(): Promise<void> {
    const buttons = await this.getButtons();
    for (const button of buttons) {
      if ((await button.text()).includes('Save Changes')) {
        return button.click();
      }
    }
    throw new Error('Save Changes button not found');
  }
}
