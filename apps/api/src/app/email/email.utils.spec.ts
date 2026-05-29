import { getLanguageFromResetUrl } from './email.utils';

describe('getLanguageFromResetUrl', () => {
  it('should return hu when callbackURL contains language=hu', () => {
    const callbackURL = encodeURIComponent(
      'http://localhost:4200/auth/reset-password?language=hu',
    );

    const lang = getLanguageFromResetUrl(
      `http://localhost:3000/api/auth/reset-password?callbackURL=${callbackURL}`,
    );

    expect(lang).toBe('hu');
  });

  it('should return en when callbackURL contains language=en', () => {
    const callbackURL = encodeURIComponent(
      'http://localhost:4200/auth/reset-password?language=en',
    );

    const lang = getLanguageFromResetUrl(
      `http://localhost:3000/api/auth/reset-password?callbackURL=${callbackURL}`,
    );

    expect(lang).toBe('en');
  });

  it('should return en when callbackURL parameter is missing', () => {
    const lang = getLanguageFromResetUrl(
      'http://localhost:3000/api/auth/reset-password',
    );

    expect(lang).toBe('en');
  });

  it('should return en when URL is invalid', () => {
    const lang = getLanguageFromResetUrl('not-a-valid-url');

    expect(lang).toBe('en');
  });
});
