import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import {
  ProfileVisibilitySettingsComponent,
  VisibilityLevel,
} from './visibility-settings.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProfileVisibilitySettingsHarness } from './visibility-settings.harness';

const privateVisibilityText = 'Private (Only you)';
const recruiterVisibilityText = 'Recruiter (Verified recruiters)';
const registeredVisibilityText = 'Registered (Logged-in members)';
const publicVisibilityText = 'Public (Anyone)';
describe('ProfileVisibilitySettingsComponent', () => {
  let harness: ProfileVisibilitySettingsHarness;
  let component: ProfileVisibilitySettingsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileVisibilitySettingsComponent, getTranslocoModule()],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProfileVisibilitySettingsComponent);
    component = fixture.componentInstance;
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ProfileVisibilitySettingsHarness,
    );
  });

  it('should initialize with default private visibility', async () => {
    expect(await harness.getLevelText()).toBe(privateVisibilityText);
    expect(await harness.isDecreaseDisabled()).toBe(true);
    expect(await harness.isIncreaseDisabled()).toBe(false);
  });

  it('should increase visibility when plus button is clicked', async () => {
    await harness.clickIncrease();
    expect(await harness.getLevelText()).toBe(recruiterVisibilityText);
    expect(component.visibilityLevel()).toBe(VisibilityLevel.RECRUITER);

    await harness.clickIncrease();
    expect(await harness.getLevelText()).toBe(registeredVisibilityText);
    expect(component.visibilityLevel()).toBe(VisibilityLevel.REGISTERED);

    await harness.clickIncrease();
    expect(await harness.getLevelText()).toBe(publicVisibilityText);
    expect(component.visibilityLevel()).toBe(VisibilityLevel.PUBLIC);
    expect(await harness.isIncreaseDisabled()).toBe(true);
  });

  it('should decrease visibility when minus button is clicked', async () => {
    // Start at PUBLIC
    component.visibilityLevel.set(VisibilityLevel.PUBLIC);

    await harness.clickDecrease();
    expect(await harness.getLevelText()).toBe(registeredVisibilityText);
    expect(component.visibilityLevel()).toBe(VisibilityLevel.REGISTERED);

    await harness.clickDecrease();
    expect(await harness.getLevelText()).toBe(recruiterVisibilityText);
    expect(component.visibilityLevel()).toBe(VisibilityLevel.RECRUITER);

    await harness.clickDecrease();
    expect(await harness.getLevelText()).toBe(privateVisibilityText);

    expect(component.visibilityLevel()).toBe(VisibilityLevel.PRIVATE);
    expect(await harness.isDecreaseDisabled()).toBe(true);
  });

  it('should set exact visibility when a step bar is clicked', async () => {
    // Click index 1 (REGISTERED = 20)
    await harness.clickStep(1);
    expect(await harness.getLevelText()).toBe(registeredVisibilityText);
    expect(component.visibilityLevel()).toBe(VisibilityLevel.REGISTERED);

    // Click index 0 (RECRUITER = 10)
    await harness.clickStep(0);
    expect(await harness.getLevelText()).toBe(recruiterVisibilityText);
    expect(component.visibilityLevel()).toBe(VisibilityLevel.RECRUITER);

    // Click index 2 (PUBLIC = 30)
    await harness.clickStep(2);
    expect(await harness.getLevelText()).toBe(publicVisibilityText);
    expect(component.visibilityLevel()).toBe(VisibilityLevel.PUBLIC);
  });
});
