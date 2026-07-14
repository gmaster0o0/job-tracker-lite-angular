import { ComponentHarness } from '@angular/cdk/testing';

export class DataManagementHarness extends ComponentHarness {
  static hostSelector = 'app-data-management';

  protected getExportButton = this.locatorFor('button[variant="outline"]');
  protected getDeleteButton = this.locatorFor('button[variant="destructive"]');

  async clickExport(): Promise<void> {
    const button = await this.getExportButton();
    await button.click();
  }

  async clickDelete(): Promise<void> {
    const button = await this.getDeleteButton();
    await button.click();
  }

  async isExportDisabled(): Promise<boolean> {
    const button = await this.getExportButton();

    return await button.getProperty<boolean>('disabled');
  }
}
