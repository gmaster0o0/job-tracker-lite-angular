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
});
