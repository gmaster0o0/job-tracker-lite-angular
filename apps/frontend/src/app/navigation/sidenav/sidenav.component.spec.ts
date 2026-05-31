import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { SidenavComponent } from './sidenav.component';
import { SidenavHarness } from './sidenav.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import {
  AuthDataAccessService,
  AuthSessionService,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  createAuthDataAccessMock,
  createAuthSessionServiceMock,
} from '@job-tracker-lite-angular/testing';
import { NavigationService } from '../navigation.service';

describe('SidenavComponent', () => {
  let harness: SidenavHarness;

  beforeEach(async () => {
    const authSessionMock = createAuthSessionServiceMock(() => () => undefined);
    authSessionMock.isAuthenticated = signal(true);

    await TestBed.configureTestingModule({
      imports: [SidenavComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        NavigationService,
        { provide: AuthSessionService, useValue: authSessionMock },
        {
          provide: AuthDataAccessService,
          useValue: createAuthDataAccessMock(),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SidenavComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SidenavHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });
});
