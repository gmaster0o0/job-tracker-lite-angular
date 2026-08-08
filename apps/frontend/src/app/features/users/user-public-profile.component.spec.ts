import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { UserPublicProfileComponent } from './user-public-profile.component';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  authSessionFixtures,
  createAuthSessionServiceMock,
  userFixtures,
  userListFixtures,
} from '@job-tracker-lite-angular/testing';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { vi } from 'vitest';

describe('UserPublicProfileComponent', () => {
  let fixture: ComponentFixture<UserPublicProfileComponent>;
  let httpMock: HttpTestingController;

  async function setup(sessionUserId: string): Promise<void> {
    const authSessionMock = createAuthSessionServiceMock(() => vi.fn(), {
      loadSession: async () => authSessionFixtures.authenticated,
    });
    authSessionMock.session.mockImplementation(() => ({
      ...authSessionFixtures.authenticated,
      user: { ...authSessionFixtures.authenticated!.user, id: sessionUserId },
    }));
    authSessionMock.role.mockImplementation(() => 'ADMIN');

    await TestBed.configureTestingModule({
      imports: [UserPublicProfileComponent, getTranslocoModule()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthSessionService, useValue: authSessionMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserPublicProfileComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('userId', userFixtures.admin.id);
    fixture.detectChanges();
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('requests the user by the id given as the route-bound input', async () => {
    await setup(userFixtures.admin.id);

    httpMock.expectOne(`/api/users/${userFixtures.admin.id}`);
  });

  it('renders the user once the request resolves', async () => {
    await setup(userFixtures.admin.id);

    httpMock
      .expectOne(`/api/users/${userFixtures.admin.id}`)
      .flush(userListFixtures[0]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain(
      userListFixtures[0].name,
    );
  });

  it('shows the not-found state instead of throwing when the request fails', async () => {
    await setup(userFixtures.admin.id);

    httpMock
      .expectOne(`/api/users/${userFixtures.admin.id}`)
      .flush('Not found', { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector('[data-testid="user-role-badge"]'),
    ).toBeNull();
  });

  it('shows the edit link only for the profile owner or a moderator/admin', async () => {
    await setup(userFixtures.admin.id);

    httpMock
      .expectOne(`/api/users/${userFixtures.admin.id}`)
      .flush(userListFixtures[0]);
    fixture.detectChanges();
    await fixture.whenStable();

    const editLink = fixture.nativeElement.querySelector(
      '[data-testid="edit-profile-button"]',
    );
    expect(editLink?.getAttribute('href')).toBe(
      `/profile/${userFixtures.admin.id}`,
    );
  });
});
