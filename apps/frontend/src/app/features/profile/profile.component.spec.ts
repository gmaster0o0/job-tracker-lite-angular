import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { ProfileHarness } from './profile.harness';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  createProfileDataAccessMock,
  userProfileFixtures,
} from '@job-tracker-lite-angular/testing';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
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
      imports: [ProfileComponent, getTranslocoModule()],
      providers: [
        { provide: ProfileDataAccessService, useValue: dataAccessMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;

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

    await fixture.whenStable();
    await harness.savePersonal();

    expect(dataAccessMock.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Doe',
      }),
    );
  });

  it('should update bio on save', async () => {
    await harness.clickEditPersonal();
    await harness.setBio('Short bio\nwith two lines');

    await fixture.whenStable();
    await harness.savePersonal();

    expect(dataAccessMock.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        bio: 'Short bio\nwith two lines',
      }),
    );
  });

  it('should update contact info on save', async () => {
    await harness.clickEditContact();
    await harness.setEmail('new-email@example.com');

    await fixture.whenStable();
    await harness.saveContact();

    expect(dataAccessMock.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new-email@example.com',
      }),
    );
  });

  it('should send contact visibility when saving contact section', async () => {
    const updateDto = {
      ...userProfileFixtures.johnDoe,
      contactVisibility: false,
    };
    await component.saveSection('contact', updateDto);

    expect(dataAccessMock.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        contactVisibility: false,
      }),
    );
  });
});
