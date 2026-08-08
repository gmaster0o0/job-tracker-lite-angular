import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withDebugTracing,
} from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { appRoutes } from './app.routes';
import {
  backendErrorInterceptor,
  provideAppTransloco,
} from '@job-tracker-lite-angular/frontend-data-access';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([backendErrorInterceptor])),
    ...provideAppTransloco('/assets/i18n/'),
  ],
};
