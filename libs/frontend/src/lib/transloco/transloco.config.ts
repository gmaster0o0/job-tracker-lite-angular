export interface TranslocoKeysManagerConfigOptions {
  appName: string;
  defaultLang?: string;
  langs?: string[];
}

export function createTranslocoKeysManagerConfig({
  appName,
  defaultLang = 'en',
  langs = ['en', 'hu'],
}: TranslocoKeysManagerConfigOptions) {
  const i18nPath = `apps/${appName}/public/assets/i18n/`;

  return {
    rootTranslationsPath: i18nPath,
    defaultLang,
    langs,
    keysManager: {
      input: i18nPath,
      output: i18nPath,
      unflat: true,
      addMissingKeys: true,
      defaultValue: '{{key}}',
      marker: 'marker',
    },
  };
}

const config = {
  ...createTranslocoKeysManagerConfig({ appName: 'frontend' }),

  input: ['apps/frontend/src', 'libs/frontend/src'],
  scopePathMap: {
    errors: 'libs/frontend/src/assets/i18n',
  },
};

export default config;
