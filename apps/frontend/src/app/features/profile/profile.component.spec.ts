import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
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
    await harness.savePersonal();

    expect(dataAccessMock.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        bio: 'Short bio with two lines',
      }),
    );
  });

  it('should update contact info on save', async () => {
    await harness.clickEditContact();
    await harness.setEmail('new-email@example.com');
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
      contactVisibility: 0,
    };
    await component.saveSection('contact', updateDto);

    expect(dataAccessMock.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        contactVisibility: 0,
      }),
    );
  });
});

describe('ProfileComponent (mod mode)', () => {
  const targetUserId = 'target-user-id';

  let harness: ProfileHarness;
  let httpMock: HttpTestingController;
  let fixture: any;

  async function setup(): Promise<void> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProfileComponent, getTranslocoModule()],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    fixture.componentRef.setInput('mode', 'mod');
    fixture.componentRef.setInput('targetUserId', targetUserId);
    fixture.detectChanges();

    httpMock = TestBed.inject(HttpTestingController);
    // ProfileDataAccessService.profileResource (the own-profile GET) is a
    // root-provided field created regardless of mode, so it fires too and
    // must be drained or the harness's stability wait never resolves.
    httpMock.expectOne('/api/profile').flush(userProfileFixtures.johnDoe);
    httpMock
      .expectOne(`/api/users/${targetUserId}/profile`)
      .flush({ ...userProfileFixtures.johnDoe, id: targetUserId });
    await fixture.whenStable();

    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ProfileHarness,
    );
  }

  it('shows the saved value immediately, without a page reload', async () => {
    await setup();

    await harness.clickEditContact();
    await harness.setEmail('updated@example.com');
    await harness.saveContact();

    httpMock.expectOne(`/api/users/${targetUserId}/profile`).flush({
      ...userProfileFixtures.johnDoe,
      id: targetUserId,
      email: 'updated@example.com',
    });
    await fixture.whenStable();

    expect(await harness.getEmail()).toBe('updated@example.com');
    httpMock.verify();
  });
});
