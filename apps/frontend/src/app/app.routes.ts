import { Route } from '@angular/router';
import { StatusComponent } from './status/status.component';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
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
