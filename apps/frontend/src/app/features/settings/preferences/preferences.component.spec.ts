import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreferencesComponent } from './preferences.component';
import { PreferencesHarness } from './preferences.harness';
import { UserPreferencesService } from '@job-tracker-lite-angular/frontend-data-access';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { createMediaQueryListMock } from '@job-tracker-lite-angular/testing';
import { vi } from 'vitest';

describe('PreferencesComponent', () => {
  let component: PreferencesComponent;
  let fixture: ComponentFixture<PreferencesComponent>;
  let harness: PreferencesHarness;
  let preferences: UserPreferencesService;

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        ...createMediaQueryListMock(false, () => vi.fn()),
        media: query,
      })),
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferencesComponent, getTranslocoModule()],
      providers: [UserPreferencesService],
    }).compileComponents();

    fixture = TestBed.createComponent(PreferencesComponent);
    component = fixture.componentInstance;
    preferences = TestBed.inject(UserPreferencesService);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      PreferencesHarness,
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display preferences page title', async () => {
    const title = await harness.getPageTitle();
    expect(title).toContain('Preferences');
  });

  it('should render appearance component', async () => {
    const appearanceHarness = await harness.getAppearanceHarness();
    expect(appearanceHarness).toBeTruthy();
  });

  it('should have appearance options available', async () => {
    const appearanceHarness = await harness.getAppearanceHarness();
    const options = await appearanceHarness.getAppearanceOptions();
    expect(options.length).toBe(3);
  });

  it('should update theme when appearance option is selected', async () => {
    const appearanceHarness = await harness.getAppearanceHarness();
    await appearanceHarness.selectAppearanceOption('dark');

    expect(preferences.theme()).toBe('dark');
  });

  it('should persist theme selection', async () => {
    const appearanceHarness = await harness.getAppearanceHarness();
    await appearanceHarness.selectAppearanceOption('system');

    expect(preferences.theme()).toBe('system');
    expect(
      JSON.parse(localStorage.getItem('user-preferences') ?? '{}').theme,
    ).toBe('system');
  });
});
