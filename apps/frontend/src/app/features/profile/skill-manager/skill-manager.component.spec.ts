import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTranslocoModule,
  VisibilityLevel,
} from '@job-tracker-lite-angular/frontend-shared';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { userProfileFixtures } from '@job-tracker-lite-angular/testing';
import { SkillManagerComponent } from './skill-manager.component';
import { SkillManagerHarness } from './skill-manager.component.harness';

@Component({
  standalone: true,
  imports: [SkillManagerComponent],
  template: `<app-skill-manager [profile]="profile" />`,
})
class HostComponent {
  profile = userProfileFixtures.johnDoe;
}

describe('SkillManagerComponent', () => {
  let harness: SkillManagerHarness;
  let fixture: any;
  const updateProfile = vi.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    updateProfile.mockClear();

    await TestBed.configureTestingModule({
      imports: [HostComponent, getTranslocoModule()],
      providers: [
        {
          provide: ProfileDataAccessService,
          useValue: {
            updateProfile,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);

    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SkillManagerHarness,
    );
  });

  it('should hide save and discard controls when unchanged', async () => {
    expect(await harness.hasSaveButton()).toBe(false);
    expect(await harness.hasDiscardButton()).toBe(false);
  });

  it('should add a skill by clicking "Add new element"', async () => {
    await harness.enterSkill('GraphQL');

    await harness.clickAddNewElement();

    const skills = await harness.getSkillTexts();
    expect(skills.some((skill) => skill.includes('GraphQL'))).toBe(true);
    expect(await harness.hasSaveButton()).toBe(true);
    expect(await harness.hasDiscardButton()).toBe(true);
  });

  it('should remove skill and discard changes', async () => {
    const before = await harness.getSkillTexts();

    await harness.removeSkillAt(0);
    expect(await harness.hasDiscardButton()).toBe(true);

    await harness.clickDiscard();

    const after = await harness.getSkillTexts();
    expect(after).toEqual(before);
    expect(await harness.hasSaveButton()).toBe(false);
  });

  it('should save modified skills', async () => {
    await harness.enterSkill('Playwright Plus');

    await harness.clickAddNewElement();
    await harness.clickVisibilityStep(0);

    const saveButton = await harness.hasSaveButton();
    expect(saveButton).toBe(true);

    await harness.clickSave();

    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        coreSkills: expect.arrayContaining(['Playwright Plus']),
        skillsVisibility: VisibilityLevel.RECRUITER,
      }),
    );
  });

  describe('mode-based routing', () => {
    it('calls updateProfile when mode is "own" (default)', async () => {
      await harness.enterSkill('Unique Test Skill A');
      await harness.clickAddNewElement();
      await harness.clickSave();

      expect(updateProfile).toHaveBeenCalledTimes(1);
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          coreSkills: expect.arrayContaining(['Unique Test Skill A']),
        }),
      );
    });

    it('calls updateUserProfile when mode is "mod" with targetUserId', async () => {
      const updateUserProfileSpy = vi.fn().mockResolvedValue(undefined);
      const profileDataServiceSpy = {
        updateProfile: vi.fn().mockResolvedValue(undefined),
        updateUserProfile: updateUserProfileSpy,
      };

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
        imports: [SkillManagerComponent],
        template: `<app-skill-manager
          [profile]="profile"
          [mode]="'mod'"
          [targetUserId]="'target-user-456'"
        />`,
      })
      class ModHostComponent {
        profile = userProfileFixtures.johnDoe;
      }

      const modFixture = TestBed.createComponent(ModHostComponent);
      const modHarness = await TestbedHarnessEnvironment.harnessForFixture(
        modFixture,
        SkillManagerHarness,
      );

      await modHarness.enterSkill('Unique Test Skill B');
      await modHarness.clickAddNewElement();
      await modHarness.clickSave();

      expect(updateUserProfileSpy).toHaveBeenCalledTimes(1);
      expect(updateUserProfileSpy).toHaveBeenCalledWith(
        'target-user-456',
        expect.objectContaining({
          coreSkills: expect.arrayContaining(['Unique Test Skill B']),
        }),
      );
      expect(profileDataServiceSpy.updateProfile).not.toHaveBeenCalled();
    });
  });
});
