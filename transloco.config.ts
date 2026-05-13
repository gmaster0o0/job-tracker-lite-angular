export const config = {
  rootTranslationsPath: 'apps/frontend/public/assets/i18n/',
  defaultLang: 'en',
  langs: [ 'en','hu'],
  keysManager: {
    input: 'apps/frontend/public/assets/i18n',
    output: 'apps/frontend/public/assets/i18n',
    unflat: true,
    addMissingKeys: true,
    defaultValue: '{{key}}',
    marker: 'marker',
  },
};

export default config;
