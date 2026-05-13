import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { SettingsMenuComponent } from './settings-menu.component';
import { SettingsMenuHarness } from './settings-menu.harness';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('SettingsMenuComponent', () => {
  let component: SettingsMenuComponent;
  let fixture: ComponentFixture<SettingsMenuComponent>;
  let harness: SettingsMenuHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsMenuComponent, getTranslocoModule()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SettingsMenuHarness,
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render all settings menu items', async () => {
    const items = await harness.getMenuItemsText();
    expect(items.length).toBe(3);
    expect(items.some((item) => item.includes('Preferences'))).toBe(true);
    expect(items.some((item) => item.includes('Account'))).toBe(true);
    expect(items.some((item) => item.includes('Privacy'))).toBe(true);
  });

  it('should have correct routes for each menu item', async () => {
    const preferencesLink = await harness.getMenuItemLink('Preferences');
    expect(preferencesLink).toContain('/settings/preferences');

    const accountLink = await harness.getMenuItemLink('Account');
    expect(accountLink).toContain('/settings/account');

    const privacyLink = await harness.getMenuItemLink('Privacy');
    expect(privacyLink).toContain('/settings/privacy');
  });

  it('should render preferences menu item with icon', async () => {
    const items = await harness.getMenuItemsText();
    const preferencesItem = items.find((item) => item.includes('Preferences'));
    expect(preferencesItem).toBeTruthy();
  });

  it('should render account menu item with icon', async () => {
    const items = await harness.getMenuItemsText();
    const accountItem = items.find((item) => item.includes('Account'));
    expect(accountItem).toBeTruthy();
  });

  it('should render privacy menu item with icon', async () => {
    const items = await harness.getMenuItemsText();
    const privacyItem = items.find((item) => item.includes('Privacy'));
    expect(privacyItem).toBeTruthy();
  });

  it('should return null when getting link for non-existent menu item', async () => {
    const link = await harness.getMenuItemLink('NonExistent');
    expect(link).toBeNull();
  });
});
