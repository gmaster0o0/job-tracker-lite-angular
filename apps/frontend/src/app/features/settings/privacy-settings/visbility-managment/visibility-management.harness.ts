import { ComponentHarness } from '@angular/cdk/testing';
import { ProfileVisibilitySettingsHarness } from '@job-tracker-lite-angular/frontend-shared';

export class VisibilityManagementHarness extends ComponentHarness {
  static hostSelector = 'app-visibility-management';

  private readonly actionButton = this.locatorFor(
    '[data-testid="visibilityManagementActionButton"]',
  );
  private readonly saveStateIndicator = this.locatorFor(
    '[data-testid="saveStateIndicator"]',
  );
  private readonly visibilitySettings = this.locatorForAll(
    ProfileVisibilitySettingsHarness,
  );

  async clickActionButton(): Promise<void> {
    const btn = await this.actionButton();
    await btn.click();
  }

  async getActionButtonText(): Promise<string> {
    const btn = await this.actionButton();
    return btn.text();
  }

  async getSaveStateText(): Promise<string> {
    const el = await this.saveStateIndicator();
    return el ? el.text() : '';
  }

  async getVisibilitySettingsCount(): Promise<number> {
    const items = await this.visibilitySettings();
    return items.length;
  }

  async getVisibilitySettingHarnessAt(
    index: number,
  ): Promise<ProfileVisibilitySettingsHarness> {
    const items = await this.visibilitySettings();
    if (!items[index])
      throw new Error('Visibility setting not found at index ' + index);
    return items[index];
  }
}
