import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { AppearanceComponent } from './appearance.component';
import { AppearanceHarness } from './appearance.harness';
import { ThemeService } from '@job-tracker-lite-angular/frontend-data-access';

describe('AppearanceComponent', () => {
  let component: AppearanceComponent;
  let fixture: ComponentFixture<AppearanceComponent>;
  let harness: AppearanceHarness;
  let themeService: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppearanceComponent],
      providers: [ThemeService],
    }).compileComponents();

    fixture = TestBed.createComponent(AppearanceComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();

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

  it('should initialize with theme service value', () => {
    themeService.theme.set('dark');
    const newFixture = TestBed.createComponent(AppearanceComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.appearance()).toBe('dark');
  });

  it('should update theme service when appearance changes', async () => {
    await harness.selectAppearanceOption('dark');
    fixture.detectChanges();

    expect(themeService.theme()).toBe('dark');
  });

  it('should update appearance signal when selecting light mode', async () => {
    await harness.selectAppearanceOption('light');
    fixture.detectChanges();

    expect(component.appearance()).toBe('light');
  });

  it('should update appearance signal when selecting dark mode', async () => {
    await harness.selectAppearanceOption('dark');
    fixture.detectChanges();

    expect(component.appearance()).toBe('dark');
  });

  it('should update appearance signal when selecting system mode', async () => {
    await harness.selectAppearanceOption('system');
    fixture.detectChanges();

    expect(component.appearance()).toBe('system');
  });

  it('should apply correct styling to selected option', async () => {
    await harness.selectAppearanceOption('dark');
    fixture.detectChanges();

    expect(component.appearance()).toBe('dark');
  });
});
