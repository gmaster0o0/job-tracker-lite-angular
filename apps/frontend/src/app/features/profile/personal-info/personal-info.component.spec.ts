import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { PersonalInfoComponent } from './personal-info.component';
import { PersonalInfoHarness } from './personal-info.harness';
import {
  getTranslocoModule,
  VisibilityLevel,
} from '@job-tracker-lite-angular/frontend-shared';
import { userProfileFixtures } from '@job-tracker-lite-angular/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('PersonalInfoComponent', () => {
  let harness: PersonalInfoHarness;
  let fixture: any;
  let component: PersonalInfoComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalInfoComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalInfoComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('profile', userProfileFixtures.johnDoe);
    fixture.componentRef.setInput('editData', {
      ...userProfileFixtures.johnDoe,
    });

    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      PersonalInfoHarness,
    );
  });

  it('should display personal information', async () => {
    expect(await harness.getName()).toBe(userProfileFixtures.johnDoe.name);
    expect(await harness.getTitle()).toBe(userProfileFixtures.johnDoe.title);
    expect(await harness.getCity()).toBe(userProfileFixtures.johnDoe.city);
    expect(await harness.getBio()).toBe(userProfileFixtures.johnDoe.bio);
  });

  it('should emit edit when edit button is clicked', async () => {
    const editSpy = vi.spyOn(component.edit, 'emit');
    await harness.clickEdit();
    expect(editSpy).toHaveBeenCalled();
  });

  it('should emit cancelEdit when cancel button is clicked', async () => {
    fixture.componentRef.setInput('isEditing', true);
    const cancelSpy = vi.spyOn(component.cancelEdit, 'emit');
    await harness.clickCancel();
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should emit save with updated data when save button is clicked', async () => {
    fixture.componentRef.setInput('isEditing', true);
    const saveSpy = vi.spyOn(component.save, 'emit');

    await harness.setName('Jane Doe');
    await harness.setTitle('Senior Engineer');
    await harness.setCity('New York');
    await harness.setBio('New bio');
    await harness.clickVisibilityStep(0);

    await harness.clickSave();

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Doe',
        title: 'Senior Engineer',
        city: 'New York',
        bio: 'New bio',
        personalVisibility: VisibilityLevel.RECRUITER,
      }),
    );
  });

  it('should only emit fields managed by this section on save', () => {
    fixture.componentRef.setInput('isEditing', true);
    const saveSpy = vi.spyOn(component.save, 'emit');

    component.onSave();

    expect(saveSpy).toHaveBeenCalledWith({
      name: userProfileFixtures.johnDoe.name,
      title: userProfileFixtures.johnDoe.title,
      city: userProfileFixtures.johnDoe.city,
      bio: userProfileFixtures.johnDoe.bio,
      personalVisibility: userProfileFixtures.johnDoe.personalVisibility,
    });
  });

  it('should be disabled when disabled input is true', async () => {
    fixture.componentRef.setInput('disabled', true);
    expect(await harness.isEditDisabled()).toBe(true);
  });
});
