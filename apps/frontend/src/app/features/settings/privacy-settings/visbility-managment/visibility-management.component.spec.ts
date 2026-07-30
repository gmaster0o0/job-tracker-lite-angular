import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  getTranslocoModule,
  VisibilityLevel,
} from '@job-tracker-lite-angular/frontend-shared';
import {
  createProfileDataAccessMock,
  userProfileFixtures,
} from '@job-tracker-lite-angular/testing';
import { VisibilityManagementComponent } from './visibility-management.component';
import { VisibilityManagementHarness } from './visibility-management.harness';

describe('VisibilityManagementComponent', () => {
  async function setup(profile = userProfileFixtures.johnDoe) {
    const dataAccessMock = createProfileDataAccessMock({ profile }, vi.fn);

    await TestBed.configureTestingModule({
      imports: [VisibilityManagementComponent, getTranslocoModule()],
      providers: [
        { provide: ProfileDataAccessService, useValue: dataAccessMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(VisibilityManagementComponent);
    const component = fixture.componentInstance;

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      VisibilityManagementHarness,
    );

    return { fixture, component, harness, dataAccessMock };
  }

  // fixture.whenStable() deadlocks under fake timers while the save is in
  // flight, so drive the effect that reacts to the settled value by hand.
  async function settleDebounce(
    fixture: Awaited<ReturnType<typeof setup>>['fixture'],
  ): Promise<void> {
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('renders a visibility setting for each profile section', async () => {
    const { harness } = await setup();
    expect(await harness.getVisibilitySettingsCount()).toBe(4);
  });

  it('initializes each visibility level from the profile resource', async () => {
    const profile = {
      ...userProfileFixtures.johnDoe,
      personalVisibility: VisibilityLevel.REGISTERED,
      contactVisibility: VisibilityLevel.RECRUITER,
      skillsVisibility: VisibilityLevel.PUBLIC,
      preferenceVisibility: VisibilityLevel.PRIVATE,
    };

    const { component } = await setup(profile);

    expect(component.personalVisibilityLevel()).toBe(
      VisibilityLevel.REGISTERED,
    );
    expect(component.contactVisibilityLevel()).toBe(VisibilityLevel.RECRUITER);
    expect(component.skillsVisibilityLevel()).toBe(VisibilityLevel.PUBLIC);
    expect(component.workPreferencesVisibilityLevel()).toBe(
      VisibilityLevel.PRIVATE,
    );
  });

  it('makes every section private when the shortcut button is clicked', async () => {
    const profile = {
      ...userProfileFixtures.johnDoe,
      personalVisibility: VisibilityLevel.PUBLIC,
      contactVisibility: VisibilityLevel.REGISTERED,
      skillsVisibility: VisibilityLevel.RECRUITER,
      preferenceVisibility: VisibilityLevel.PUBLIC,
    };

    const { component, harness } = await setup(profile);
    vi.useFakeTimers();

    await harness.clickActionButton();

    expect(component.personalVisibilityLevel()).toBe(VisibilityLevel.PRIVATE);
    expect(component.contactVisibilityLevel()).toBe(VisibilityLevel.PRIVATE);
    expect(component.skillsVisibilityLevel()).toBe(VisibilityLevel.PRIVATE);
    expect(component.workPreferencesVisibilityLevel()).toBe(
      VisibilityLevel.PRIVATE,
    );
    expect((await harness.getActionButtonText()).trim()).toContain(
      'Restore Previous Settings',
    );
  });

  it('restores the previous visibility levels on a second shortcut click', async () => {
    const profile = {
      ...userProfileFixtures.johnDoe,
      personalVisibility: VisibilityLevel.PUBLIC,
      contactVisibility: VisibilityLevel.REGISTERED,
      skillsVisibility: VisibilityLevel.RECRUITER,
      preferenceVisibility: VisibilityLevel.PUBLIC,
    };

    const { component, harness } = await setup(profile);
    vi.useFakeTimers();

    await harness.clickActionButton();
    await harness.clickActionButton();

    expect(component.personalVisibilityLevel()).toBe(VisibilityLevel.PUBLIC);
    expect(component.contactVisibilityLevel()).toBe(VisibilityLevel.REGISTERED);
    expect(component.skillsVisibilityLevel()).toBe(VisibilityLevel.RECRUITER);
    expect(component.workPreferencesVisibilityLevel()).toBe(
      VisibilityLevel.PUBLIC,
    );
    expect((await harness.getActionButtonText()).trim()).toContain(
      'Make All Private',
    );
  });

  it('persists the visibility levels after the debounce when a section changes', async () => {
    vi.useFakeTimers();
    const { fixture, component, harness, dataAccessMock } = await setup();

    const personal = await harness.getVisibilitySettingHarnessAt(0);
    await personal.clickIncrease();

    expect(component.personalVisibilityLevel()).toBe(VisibilityLevel.RECRUITER);
    expect(dataAccessMock.updateProfile).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);
    await settleDebounce(fixture);

    expect(dataAccessMock.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        personalVisibility: VisibilityLevel.RECRUITER,
        contactVisibility: VisibilityLevel.PRIVATE,
        skillsVisibility: VisibilityLevel.PRIVATE,
        preferenceVisibility: VisibilityLevel.PRIVATE,
      }),
    );
    expect(component.saveState()).toBe('saved');
  });

  it('holds the save while further changes keep arriving', async () => {
    vi.useFakeTimers();
    const { fixture, harness, dataAccessMock } = await setup();

    const personal = await harness.getVisibilitySettingHarnessAt(0);
    const contact = await harness.getVisibilitySettingHarnessAt(1);

    await personal.clickIncrease();
    await vi.advanceTimersByTimeAsync(600);
    await contact.clickIncrease();
    await vi.advanceTimersByTimeAsync(600);

    expect(dataAccessMock.updateProfile).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);
    await settleDebounce(fixture);

    expect(dataAccessMock.updateProfile).toHaveBeenCalledTimes(1);
    expect(dataAccessMock.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        personalVisibility: VisibilityLevel.RECRUITER,
        contactVisibility: VisibilityLevel.RECRUITER,
      }),
    );
  });

  it('does not persist anything when the profile loads without a user change', async () => {
    vi.useFakeTimers();
    const { fixture, dataAccessMock } = await setup();

    await vi.advanceTimersByTimeAsync(5000);
    await settleDebounce(fixture);

    expect(dataAccessMock.updateProfile).not.toHaveBeenCalled();
  });

  it('sets the error save state when persisting fails', async () => {
    vi.useFakeTimers();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const { fixture, component, harness, dataAccessMock } = await setup();
    dataAccessMock.updateProfile.mockRejectedValueOnce(new Error('boom'));

    const personal = await harness.getVisibilitySettingHarnessAt(0);
    await personal.clickIncrease();

    await vi.advanceTimersByTimeAsync(1000);
    await settleDebounce(fixture);

    expect(component.saveState()).toBe('error');
    consoleError.mockRestore();
  });
});
