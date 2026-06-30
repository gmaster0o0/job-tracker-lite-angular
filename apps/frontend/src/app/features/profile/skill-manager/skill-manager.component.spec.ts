import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
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
    fixture.detectChanges();

    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SkillManagerHarness,
    );
  });

  it('should hide save and discard controls when unchanged', async () => {
    expect(await harness.hasSaveButton()).toBe(false);
    expect(await harness.hasDiscardButton()).toBe(false);
  });

  it('should add a skill with Enter key', async () => {
    await harness.enterSkill('GraphQL');
    await harness.pressEnterOnInput();
    await fixture.whenStable();
    fixture.detectChanges();

    const skills = await harness.getSkillTexts();
    expect(skills.some((skill) => skill.includes('GraphQL'))).toBe(true);
    expect(await harness.hasSaveButton()).toBe(true);
    expect(await harness.hasDiscardButton()).toBe(true);
  });

  it('should remove skill and discard changes', async () => {
    const before = await harness.getSkillTexts();

    await harness.removeSkillAt(0);
    fixture.detectChanges();
    expect(await harness.hasDiscardButton()).toBe(true);

    await harness.clickDiscard();
    fixture.detectChanges();

    const after = await harness.getSkillTexts();
    expect(after).toEqual(before);
    expect(await harness.hasSaveButton()).toBe(false);
  });

  it('should save modified skills', async () => {
    await harness.enterSkill('Playwright');
    await harness.pressEnterOnInput();
    await fixture.whenStable();
    fixture.detectChanges();

    await harness.clickSave();

    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        coreSkills: expect.arrayContaining(['Playwright']),
      }),
    );
  });
});
