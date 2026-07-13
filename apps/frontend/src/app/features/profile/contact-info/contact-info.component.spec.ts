import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { ContactInfoComponent } from './contact-info.component';
import { ContactInfoHarness } from './contact-info.harness';
import {
  getTranslocoModule,
  VisibilityLevel,
} from '@job-tracker-lite-angular/frontend-shared';
import { userProfileFixtures } from '@job-tracker-lite-angular/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ContactInfoComponent', () => {
  let harness: ContactInfoHarness;
  let fixture: any;
  let component: ContactInfoComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactInfoComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactInfoComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('profile', userProfileFixtures.johnDoe);
    fixture.componentRef.setInput('editData', {
      ...userProfileFixtures.johnDoe,
    });

    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ContactInfoHarness,
    );
  });

  it('should display contact information', async () => {
    expect(await harness.getEmail()).toBe(userProfileFixtures.johnDoe.email);
    expect(await harness.getLinkedin()).toBe(
      userProfileFixtures.johnDoe.linkedin,
    );
    expect(await harness.getGithub()).toBe(userProfileFixtures.johnDoe.github);
    expect(await harness.getWebsite()).toBe(
      userProfileFixtures.johnDoe.webpage,
    );
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

    await harness.setEmail('new-email@example.com');
    await harness.setLinkedin('new-linkedin');
    await harness.setGithub('new-github');
    await harness.setWebsite('new-website.com');
    await harness.clickVisibilityStep(1);

    await harness.clickSave();

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new-email@example.com',
        linkedin: 'new-linkedin',
        github: 'new-github',
        webpage: 'new-website.com',
        contactVisibility: VisibilityLevel.REGISTERED,
      }),
    );
  });

  it('should be disabled when disabled input is true', async () => {
    fixture.componentRef.setInput('disabled', true);
    // The edit button should have a disabled attribute or class.
    // Our EditButtonComponent handles this.
    expect(await harness.isEditDisabled()).toBe(true);
  });
});
