import { ComponentHarness } from '@angular/cdk/testing';

export class ProfileVisibilitySettingsHarness extends ComponentHarness {
  static hostSelector = 'app-profile-visibility-settings';

  private _label = this.locatorFor('[data-testid="visibility-label"]');
  private _levelText = this.locatorFor('[data-testid="visibility-level-text"]');
  private _decreaseBtn = this.locatorFor(
    '[data-testid="decrease-visibility-btn"]',
  );
  private _increaseBtn = this.locatorFor(
    '[data-testid="increase-visibility-btn"]',
  );
  private _stepBars = this.locatorForAll('[data-testid="visibility-step-bar"]');

  async getLabelText(): Promise<string> {
    return (await this._label()).text();
  }

  async getLevelText(): Promise<string> {
    return (await this._levelText()).text();
  }

  async clickDecrease(): Promise<void> {
    return (await this._decreaseBtn()).click();
  }

  async clickIncrease(): Promise<void> {
    return (await this._increaseBtn()).click();
  }

  async clickStep(index: number): Promise<void> {
    const bars = await this._stepBars();
    if (bars[index]) {
      await bars[index].click();
    }
  }

  async isDecreaseDisabled(): Promise<boolean> {
    return (await this._decreaseBtn()).getProperty('disabled');
  }

  async isIncreaseDisabled(): Promise<boolean> {
    return (await this._increaseBtn()).getProperty('disabled');
  }
}
