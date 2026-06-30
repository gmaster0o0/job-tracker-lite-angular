import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Component } from '@angular/core';
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

  beforeEach(async () => {
    const profileDataServiceSpy = {
      updateProfile: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [HostComponent, getTranslocoModule()],
      providers: [
        { provide: ProfileDataAccessService, useValue: profileDataServiceSpy },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);

    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CareerPreferenceHarness,
    );
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
});
