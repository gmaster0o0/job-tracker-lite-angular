import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { ProfileHarness } from './profile.harness';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  createProfileDataAccessMock,
  userProfileFixtures,
} from '@job-tracker-lite-angular/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ProfileComponent', () => {
  let harness: ProfileHarness;
  let dataAccessMock: any;
  let fixture: any;
  let component: ProfileComponent;

  beforeEach(async () => {
    dataAccessMock = createProfileDataAccessMock(
      { profile: userProfileFixtures.johnDoe },
      vi.fn,
    );

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: ProfileDataAccessService, useValue: dataAccessMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ProfileHarness,
    );
  });

  it('should display user name', async () => {
    await harness.clickEditPersonal();
    expect(await harness.getName()).toBe(userProfileFixtures.johnDoe.name);
  });

  it('should update name on save', async () => {
    await harness.clickEditPersonal();
    await harness.setName('Jane Doe');
    fixture.detectChanges();
    await fixture.whenStable();
    await harness.save();

    expect(dataAccessMock.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Doe',
      }),
    );
  });

  it('should send personalVisibility when saving personal section', async () => {
    component.editSection('personal', userProfileFixtures.johnDoe);
    component.editData.personalVisibility = false;

    await component.saveSection('personal');

    expect(dataAccessMock.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        personalVisibility: false,
      }),
    );
  });

  it('should send contactVisibility when saving contact section', async () => {
    component.editSection('contact', userProfileFixtures.johnDoe);
    component.editData.contactVisibility = false;

    await component.saveSection('contact');

    expect(dataAccessMock.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        contactVisibility: false,
      }),
    );
  });

  it('should evaluate section visibility with isPublic master switch', () => {
    expect(
      component.isSectionVisible(
        userProfileFixtures.johnDoe,
        'skillsVisibility',
      ),
    ).toBe(true);

    expect(
      component.isSectionVisible(
        {
          ...userProfileFixtures.johnDoe,
          isPublic: false,
          skillsVisibility: true,
        },
        'skillsVisibility',
      ),
    ).toBe(false);
  });
});
