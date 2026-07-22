import { describe, it, expect } from 'vitest';
import { resolveSystemLanguage } from './system-language.util';

describe('resolveSystemLanguage', () => {
  const stub = (languages: string[]) => {
    Object.defineProperty(navigator, 'languages', {
      value: languages,
      configurable: true,
    });
    Object.defineProperty(navigator, 'language', {
      value: languages[0],
      configurable: true,
    });
  };

  it('should match a primary subtag against the available languages', () => {
    stub(['en-US']);
    expect(resolveSystemLanguage(['hu', 'en'])).toBe('en');
  });

  it('should match case-insensitively', () => {
    stub(['EN-us']);
    expect(resolveSystemLanguage(['hu', 'en'])).toBe('en');
  });

  it('should return the first available match across multiple candidates', () => {
    stub(['de-DE', 'hu-HU', 'en-US']);
    expect(resolveSystemLanguage(['hu', 'en'])).toBe('hu');
  });

  it('should return null when nothing matches', () => {
    stub(['de-DE', 'fr-FR']);
    expect(resolveSystemLanguage(['hu', 'en'])).toBeNull();
  });

  it('should fall back to navigator.language when navigator.languages is empty', () => {
    Object.defineProperty(navigator, 'languages', {
      value: [],
      configurable: true,
    });
    Object.defineProperty(navigator, 'language', {
      value: 'en-GB',
      configurable: true,
    });

    expect(resolveSystemLanguage(['hu', 'en'])).toBe('en');
  });
});
