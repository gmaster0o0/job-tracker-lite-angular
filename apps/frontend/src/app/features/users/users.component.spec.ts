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

describe('UsersComponent', () => {
  let fixture: ComponentFixture<UsersComponent>;
  let component: UsersComponent;
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
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and render users', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      '[data-testid="users-row"]',
    );

    expect(usersDataAccessMock.listUsers).toHaveBeenCalledTimes(1);
    expect(rows).toHaveLength(userListFixtures.length);
    expect(fixture.nativeElement.textContent).toContain(
      userListFixtures[0].name,
    );
    expect(fixture.nativeElement.textContent).toContain(
      userListFixtures[0].email,
    );
  });

  it('should render profile links for each user', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll(
        '[data-testid="view-profile-link"]',
      ),
    ) as HTMLAnchorElement[];

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/profile/user_admin',
      '/profile/user_mod',
      '/profile/user_rec',
      '/profile/user_basic',
    ]);
  });
});
