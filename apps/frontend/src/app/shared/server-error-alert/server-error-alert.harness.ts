import { ComponentHarness } from '@angular/cdk/testing';

export class ServerErrorAlertHarness extends ComponentHarness {
  static hostSelector = 'app-server-error-alert';

  private readonly alertLocator = this.locatorForOptional('[role="alert"]');
  private readonly titleLocator = this.locatorForOptional('h4');
  private readonly descriptionLocator = this.locatorForOptional('p');

  async isVisible(): Promise<boolean> {
    const alert = await this.alertLocator();
    return alert !== null;
  }

  async getTitle(): Promise<string> {
    const titleElement = await this.titleLocator();
    return titleElement ? titleElement.text() : '';
  }

  async getDescription(): Promise<string> {
    const descElement = await this.descriptionLocator();
    return descElement ? descElement.text() : '';
  }

  async getTextContent(): Promise<string> {
    const alert = await this.alertLocator();
    return alert ? alert.text() : '';
  }
}
