import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { provideTransloco } from '@jsverse/transloco';
import { SharedTranslocoLoader } from '@job-tracker-lite-angular/frontend-data-access';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withFetch()),
    { provide: 'I18N_PATH', useValue: '/assets/i18n/' },
    provideTransloco({
      config: {
        availableLangs: ['hu', 'en'],
        defaultLang: 'hu',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: SharedTranslocoLoader,
    }),
  ],
};
