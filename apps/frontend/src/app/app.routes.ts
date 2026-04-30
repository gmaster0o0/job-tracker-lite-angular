import { Route } from '@angular/router';
import { StatusComponent } from './status/status.component';

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
              import('./features/settings/settings.component').then(
                (m) => m.SettingsComponent,
              ),
          },
        ],
      },
      {
        path: 'profile',
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
    ],
  },
  {
    path: 'status',
    component: StatusComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
