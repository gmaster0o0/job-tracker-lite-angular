import { toSlug, toUserSlugBase } from './slug.util';

describe('toSlug', () => {
  it('lowercases and hyphenates a plain name', () => {
    expect(toSlug('Demo User')).toBe('demo-user');
  });

  it('collapses whitespace runs into a single hyphen', () => {
    expect(toSlug('Demo   \t User')).toBe('demo-user');
  });

  it('trims leading and trailing whitespace', () => {
    expect(toSlug('  Demo User  ')).toBe('demo-user');
  });

  it('strips diacritics from decomposable Latin characters', () => {
    expect(toSlug('Gábor Kotél')).toBe('gabor-kotel');
    expect(toSlug('Zoltán Ürményi')).toBe('zoltan-urmenyi');
  });

  it('handles Hungarian double acute accents', () => {
    expect(toSlug('Ödön Ő')).toBe('odon-o');
  });

  it.each([
    ['Łukasz Nowak', 'lukasz-nowak'],
    ['Ægir Þórsson', 'aegir-thorsson'],
    ['Straße Müller', 'strasse-muller'],
    ['Øystein Ødegård', 'oystein-odegard'],
  ])(
    'maps non-decomposable Latin letters: %s -> %s',
    (name: string, expected: string) => {
      expect(toSlug(name)).toBe(expected);
    },
  );

  it('drops punctuation and symbols', () => {
    expect(toSlug("O'Brien (Jr.)")).toBe('obrien-jr');
  });

  it('keeps existing hyphens', () => {
    expect(toSlug('Anne-Marie Smith')).toBe('anne-marie-smith');
  });

  it('keeps digits', () => {
    expect(toSlug('User 2')).toBe('user-2');
  });

  it.each(['!!!', 'Пётр', '日本語', '🙂', '   ', ''])(
    'returns an empty string when nothing slug-able remains: %s',
    (name: string) => {
      expect(toSlug(name)).toBe('');
    },
  );
});

describe('toUserSlugBase', () => {
  it('returns the slug when the name yields one', () => {
    expect(toUserSlugBase('Gábor Kotél')).toBe('gabor-kotel');
  });

  it.each([
    ['!!!', 'user'],
    ['!!!!!', 'user'],
    ['Пётр', 'user'],
    ['', 'user'],
  ])('falls back to "user" for %s', (name: string, expected: string) => {
    expect(toUserSlugBase(name)).toBe(expected);
  });

  it.each([null, undefined])('falls back to "user" for %s', (name) => {
    expect(toUserSlugBase(name)).toBe('user');
  });

  it('is not unique on its own - names that normalise alike share a base', () => {
    // The uniqueness guarantee lives in the caller (AuthConfigFactory probes
    // for a free slug) and in the unique index on User.slug, not here.
    expect(toUserSlugBase('!!!')).toBe(toUserSlugBase('!!!!!'));
  });
});
