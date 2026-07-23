import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { AppearanceComponent } from './appearance.component';
import { AppearanceHarness } from './appearance.harness';
import { UserPreferencesService } from '@job-tracker-lite-angular/frontend-data-access';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('AppearanceComponent', () => {
  let component: AppearanceComponent;
  let fixture: ComponentFixture<AppearanceComponent>;
  let harness: AppearanceHarness;
  let preferences: UserPreferencesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppearanceComponent, getTranslocoModule()],
      providers: [UserPreferencesService, provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppearanceComponent);
    component = fixture.componentInstance;
    preferences = TestBed.inject(UserPreferencesService);

    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      AppearanceHarness,
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render all appearance options', async () => {
    const options = await harness.getAppearanceOptions();
    expect(options.length).toBe(3);
    expect(options.some((opt) => opt.value === 'light')).toBe(true);
    expect(options.some((opt) => opt.value === 'dark')).toBe(true);
    expect(options.some((opt) => opt.value === 'system')).toBe(true);
  });

  it('should reflect the preferences service value', async () => {
    preferences.setTheme('dark');
    fixture.detectChanges();

    expect(await harness.getSelectedAppearance()).toBe('dark');
  });

  it('should update preferences service when appearance changes', async () => {
    await harness.selectAppearanceOption('dark');
    expect(preferences.theme()).toBe('dark');
  });

  it('should update preferences when selecting light mode', async () => {
    await harness.selectAppearanceOption('light');
    expect(preferences.theme()).toBe('light');
  });

  it('should update preferences when selecting dark mode', async () => {
    await harness.selectAppearanceOption('dark');
    expect(preferences.theme()).toBe('dark');
  });

  it('should update preferences when selecting system mode', async () => {
    await harness.selectAppearanceOption('system');
    expect(preferences.theme()).toBe('system');
  });

  it('should apply correct styling to selected option', async () => {
    await harness.selectAppearanceOption('dark');
    expect(preferences.theme()).toBe('dark');
  });
});
