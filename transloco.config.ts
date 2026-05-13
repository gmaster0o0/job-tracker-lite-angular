export const config = {
  inputPath: 'apps/frontend/src',
  rootTranslationsPath: 'apps/frontend/public/assets/i18n/',
  defaultLang: 'en',
  langs: ['hu', 'en'],
  keysManager: {
    unflat: true,
    addMissingKeys: true,
    defaultValue: '{{key}}',
  },
};

export default config;
