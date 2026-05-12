import { ComponentHarness } from '@angular/cdk/testing';

export class SettingsMenuHarness extends ComponentHarness {
  static hostSelector = 'app-settings-menu';

  private readonly getMenuItems = this.locatorForAll('a[hlmSidebarMenuButton]');

  async getMenuItemsText(): Promise<string[]> {
    const items = await this.getMenuItems();
    const texts: string[] = [];

    for (const item of items) {
      const text = await item.text();
      texts.push(text.trim());
    }

    return texts;
  }

  async clickMenuItem(label: string): Promise<void> {
    const items = await this.getMenuItems();

    for (const item of items) {
      const text = await item.text();
      if (text.includes(label)) {
        await item.click();
        return;
      }
    }

    throw new Error(`Menu item "${label}" not found`);
  }

  async getMenuItemLink(label: string): Promise<string | null> {
    const items = await this.getMenuItems();

    for (const item of items) {
      const text = await item.text();
      if (text.includes(label)) {
        return item.getAttribute('href');
      }
    }

    return null;
  }

  async isMenuItemActive(label: string): Promise<boolean> {
    const items = await this.getMenuItems();

    for (const item of items) {
      const text = await item.text();
      if (text.includes(label)) {
        const classList = await item.getAttribute('class');
        return classList?.includes('active') ?? false;
      }
    }

    return false;
  }
}
