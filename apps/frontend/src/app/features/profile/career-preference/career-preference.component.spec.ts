import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { CareerPreferenceComponent } from './career-preference.component';
import { CareerPreferenceHarness } from './career-preference.component.harness';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { userProfileFixtures } from '@job-tracker-lite-angular/testing';

@Component({
  standalone: true,
  imports: [CareerPreferenceComponent],
  template: `<app-career-preference [profile]="profile" />`,
})
class HostComponent {
  profile = userProfileFixtures.johnDoe;
}

describe('CareerPreferenceComponent', () => {
  let harness: CareerPreferenceHarness;
  let component: CareerPreferenceComponent;
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let profileDataServiceSpy: { updateProfile: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    profileDataServiceSpy = {
      updateProfile: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [HostComponent, getTranslocoModule()],
      providers: [
        { provide: ProfileDataAccessService, useValue: profileDataServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);

    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CareerPreferenceHarness,
    );

    component = fixture.debugElement.query(
      By.directive(CareerPreferenceComponent),
    ).componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });

  it('should display career preference section', async () => {
    const title = await harness.getTitle();
    expect(title).toBeTruthy();
  });

  it('should have three selects', async () => {
    const experienceSelect = await harness.getExperienceLevelSelect();
    const workingStyleSelect = await harness.getWorkingStyleSelect();
    const careerTypeSelect = await harness.getCareerTypeSelect();

    expect(experienceSelect).toBeTruthy();
    expect(workingStyleSelect).toBeTruthy();
    expect(careerTypeSelect).toBeTruthy();
  });

  it('should start in idle state', async () => {
    const isSaving = await harness.isSaving();
    const isSaved = await harness.isSaved();
    const hasError = await harness.hasError();

    expect(isSaving).toBe(false);
    expect(isSaved).toBe(false);
    expect(hasError).toBe(false);
  });

  describe('debounced saving', () => {
    // fixture.whenStable() deadlocks under fake timers while the save is in
    // flight, so drive the effect that reacts to the settled value by hand.
    async function settleDebounce(): Promise<void> {
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);
    }

    it('does not save while edits keep arriving inside the debounce window', async () => {
      vi.useFakeTimers();

      component.onExperienceLevelChange('SENIOR');
      await vi.advanceTimersByTimeAsync(900);

      expect(profileDataServiceSpy.updateProfile).not.toHaveBeenCalled();
    });

    it('saves once the debounce window elapses', async () => {
      vi.useFakeTimers();

      component.onExperienceLevelChange('SENIOR');
      await vi.advanceTimersByTimeAsync(1000);
      await settleDebounce();

      expect(profileDataServiceSpy.updateProfile).toHaveBeenCalledTimes(1);
      expect(profileDataServiceSpy.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ experienceLevel: 'SENIOR' }),
      );
    });

    it('collapses rapid edits into a single save carrying the latest values', async () => {
      vi.useFakeTimers();

      component.onExperienceLevelChange('JUNIOR');
      await vi.advanceTimersByTimeAsync(400);
      component.onWorkingStyleChange('REMOTE');
      await vi.advanceTimersByTimeAsync(400);
      component.onCareerTypeChange('CONTRACT');

      expect(profileDataServiceSpy.updateProfile).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1000);
      await settleDebounce();

      expect(profileDataServiceSpy.updateProfile).toHaveBeenCalledTimes(1);
      expect(profileDataServiceSpy.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          experienceLevel: 'JUNIOR',
          workingStyle: 'REMOTE',
          careerType: 'CONTRACT',
        }),
      );
    });

    it('still debounces an edit made after an earlier save completed', async () => {
      vi.useFakeTimers();

      component.onExperienceLevelChange('SENIOR');
      await vi.advanceTimersByTimeAsync(1000);
      await settleDebounce();
      expect(profileDataServiceSpy.updateProfile).toHaveBeenCalledTimes(1);

      component.onWorkingStyleChange('HYBRID');
      await settleDebounce();

      expect(profileDataServiceSpy.updateProfile).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1000);
      await settleDebounce();

      expect(profileDataServiceSpy.updateProfile).toHaveBeenCalledTimes(2);
    });

    it('never saves when the profile input seeds the fields but nothing is edited', async () => {
      vi.useFakeTimers();

      await vi.advanceTimersByTimeAsync(5000);
      await settleDebounce();

      expect(profileDataServiceSpy.updateProfile).not.toHaveBeenCalled();
    });

    it('reports the error save state when persisting fails', async () => {
      vi.useFakeTimers();
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      profileDataServiceSpy.updateProfile.mockRejectedValueOnce(
        new Error('boom'),
      );

      component.onCareerTypeChange('PART_TIME');
      await vi.advanceTimersByTimeAsync(1000);
      await settleDebounce();

      expect(component.saveState()).toBe('error');
      consoleError.mockRestore();
    });
  });

  describe('mode-based routing', () => {
    async function settleDebounce(): Promise<void> {
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);
    }

    it('calls updateProfile when mode is "own" (default)', async () => {
      vi.useFakeTimers();

      component.onExperienceLevelChange('LEAD');
      await vi.advanceTimersByTimeAsync(1000);
      await settleDebounce();

      expect(profileDataServiceSpy.updateProfile).toHaveBeenCalledTimes(1);
      expect(profileDataServiceSpy.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ experienceLevel: 'LEAD' }),
      );
    });

    it('calls updateUserProfile when mode is "mod" with targetUserId', async () => {
      vi.useFakeTimers();

      const updateUserProfileSpy = vi.fn().mockResolvedValue(undefined);
      profileDataServiceSpy = {
        updateProfile: vi.fn().mockResolvedValue(undefined),
        updateUserProfile: updateUserProfileSpy,
      } as never;

      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [HostComponent, getTranslocoModule()],
        providers: [
          {
            provide: ProfileDataAccessService,
            useValue: profileDataServiceSpy,
          },
        ],
      }).compileComponents();

      @Component({
        standalone: true,
        imports: [CareerPreferenceComponent],
        template: `<app-career-preference
          [profile]="profile"
          [mode]="'mod'"
          [targetUserId]="'target-user-123'"
        />`,
      })
      class ModHostComponent {
        profile = userProfileFixtures.johnDoe;
      }

      const modFixture = TestBed.createComponent(ModHostComponent);
      const modComponent = modFixture.debugElement.query(
        By.directive(CareerPreferenceComponent),
      ).componentInstance;

      modComponent.onWorkingStyleChange('ON_SITE');
      await vi.advanceTimersByTimeAsync(1000);
      modFixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      expect(updateUserProfileSpy).toHaveBeenCalledTimes(1);
      expect(updateUserProfileSpy).toHaveBeenCalledWith(
        'target-user-123',
        expect.objectContaining({ workingStyle: 'ON_SITE' }),
      );
      expect(profileDataServiceSpy.updateProfile).not.toHaveBeenCalled();
    });
  });
});
