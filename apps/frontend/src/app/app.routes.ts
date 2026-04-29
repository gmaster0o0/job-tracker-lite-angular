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
        outlet: 'sidenav',
        loadComponent: () =>
          import('./navigation/main-menu/main-menu.component').then(
            (m) => m.MainMenuComponent,
          ),
      },
    ],
  },
  {
    path: 'jobs',
    children: [
      {
        path: '',
        outlet: 'sidenav',
        loadComponent: () =>
          import('./features/jobs/job-list/job-list.component').then(
            (m) => m.JobListComponent,
          ),
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
