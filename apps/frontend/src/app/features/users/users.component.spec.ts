import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { UsersDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  createUsersDataAccessMock,
  userListFixtures,
} from '@job-tracker-lite-angular/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersComponent } from './users.component';
import { UsersComponentHarness } from './users.component.harness';

describe('UsersComponent', () => {
  let fixture: ComponentFixture<UsersComponent>;
  let harness: UsersComponentHarness;
  let usersDataAccessMock: ReturnType<typeof createUsersDataAccessMock>;

  beforeEach(async () => {
    usersDataAccessMock = createUsersDataAccessMock(() => vi.fn());

    await TestBed.configureTestingModule({
      imports: [UsersComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        {
          provide: UsersDataAccessService,
          useValue: usersDataAccessMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      UsersComponentHarness,
    );
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load and render users', async () => {
    expect(await harness.getUserCount()).toBe(userListFixtures.length);
    expect(usersDataAccessMock.listUsers).toHaveBeenCalledTimes(1);
    expect(await harness.hasUserName(userListFixtures[0].name)).toBe(true);
    expect(await harness.hasUserEmail(userListFixtures[0].email)).toBe(true);
  });

  it('should render profile links for each user', async () => {
    const hrefs = await harness.getProfileLinkHrefs();
    expect(hrefs).toEqual(userListFixtures.map((user) => `/users/${user.id}`));
  });
});
