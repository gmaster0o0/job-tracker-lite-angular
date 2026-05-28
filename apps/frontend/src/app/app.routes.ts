import { Route } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';
import { guestGuard } from './features/auth/guards/guest.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),

    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: '',
        pathMatch: 'full',
        outlet: 'sidenav',
        loadComponent: () =>
          import('./navigation/main-menu/main-menu.component').then(
            (m) => m.MainMenuComponent,
          ),
      },
      {
        path: 'jobs',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            outlet: 'sidenav',
            loadComponent: () =>
              import('./navigation/jobs-menu/jobs-menu.component').then(
                (m) => m.JobsMenuComponent,
              ),
          },
          {
            path: ':id',
            outlet: 'sidenav',
            loadComponent: () =>
              import('./navigation/jobs-menu/jobs-menu.component').then(
                (m) => m.JobsMenuComponent,
              ),
          },
          {
            path: '',
            loadComponent: () =>
              import('./features/jobs/job-detail/job-detail.component').then(
                (m) => m.JobDetailComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/jobs/job-detail/job-detail.component').then(
                (m) => m.JobDetailComponent,
              ),
          },
        ],
      },
      {
        path: 'settings',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            outlet: 'sidenav',
            loadComponent: () =>
              import('./navigation/settings-menu/settings-menu.component').then(
                (m) => m.SettingsMenuComponent,
              ),
          },
          {
            path: '',
            loadComponent: () =>
              import('./features/settings/settings.component').then(
                (m) => m.SettingsComponent,
              ),
          },
          {
            path: 'preferences',
            loadComponent: () =>
              import(
                './features/settings/preferences/preferences.component'
              ).then((m) => m.PreferencesComponent),
          },
          {
            path: 'account',
            loadComponent: () =>
              import('./features/settings/account/account.component').then(
                (m) => m.AccountComponent,
              ),
          },
        ],
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            outlet: 'sidenav',
            loadComponent: () =>
              import('./navigation/main-menu/main-menu.component').then(
                (m) => m.MainMenuComponent,
              ),
          },
          {
            path: '',
            loadComponent: () =>
              import('./features/profile/profile.component').then(
                (m) => m.ProfileComponent,
              ),
          },
        ],
      },
      {
        path: 'about',
        children: [
          {
            path: '',
            outlet: 'sidenav',
            loadComponent: () =>
              import('./navigation/main-menu/main-menu.component').then(
                (m) => m.MainMenuComponent,
              ),
          },
          {
            path: '',
            loadComponent: () =>
              import('./features/about/about.component').then(
                (m) => m.AboutComponent,
              ),
          },
        ],
      },
      {
        path: 'auth',
        children: [
          {
            path: '',
            pathMatch: 'full',
            outlet: 'sidenav',
            loadComponent: () =>
              import('./navigation/main-menu/main-menu.component').then(
                (m) => m.MainMenuComponent,
              ),
          },
          {
            path: 'login',
            canActivate: [guestGuard],
            loadComponent: () =>
              import('./features/auth/login/login.component').then(
                (m) => m.LoginComponent,
              ),
          },
          {
            path: 'register',
            canActivate: [guestGuard],
            loadComponent: () =>
              import('./features/auth/register/register.component').then(
                (m) => m.RegisterComponent,
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'status',
    loadComponent: () =>
      import('./status/status.component').then((m) => m.StatusComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
