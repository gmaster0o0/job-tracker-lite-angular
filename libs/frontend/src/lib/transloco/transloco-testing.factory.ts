import {
  Translation,
  TranslocoTestingModule,
  TranslocoTestingOptions,
} from '@jsverse/transloco';

export function createTranslocoTestingModule(
  langs: Record<string, Translation>,
  options: TranslocoTestingOptions = {},
) {
  const availableLangs = Object.keys(langs);

  return TranslocoTestingModule.forRoot({
    langs,
    translocoConfig: {
      availableLangs,
      defaultLang: availableLangs[0],
    },
    preloadLangs: true,
    ...options,
  });
}
