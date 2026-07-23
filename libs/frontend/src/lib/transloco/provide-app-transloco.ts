import { EnvironmentProviders, isDevMode, Provider } from '@angular/core';
import { provideTransloco, provideTranslocoScope } from '@jsverse/transloco';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import {
  I18N_PATH,
  SharedTranslocoLoader,
} from '../services/shared-transloclo-loader';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE,
} from '../services/user-preferences.service';

provideTranslocoScope('errors');

export function provideAppTransloco(
  i18nPath = '/assets/i18n/',
): (Provider | EnvironmentProviders)[] {
  return [
    { provide: I18N_PATH, useValue: i18nPath },
    provideTransloco({
      config: {
        availableLangs: [...AVAILABLE_LANGUAGES],
        defaultLang: DEFAULT_LANGUAGE,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: SharedTranslocoLoader,
    }),
    provideTranslocoMessageformat(),
  ];
}
