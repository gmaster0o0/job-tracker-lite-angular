/**
 * Normalises a display name into a URL-safe slug.
 *
 * Accented Latin characters are decomposed and stripped of their diacritics
 * first, so "Gábor Kotél" becomes "gabor-kotel" rather than losing the accented
 * letters outright. Everything that is still not alphanumeric/whitespace/hyphen
 * is then dropped, whitespace runs collapse into a single hyphen, and the
 * result is lowercased.
 *
 * Kept in sync with the backfill in the add_user_slug migration, which reaches
 * the same result via Postgres' unaccent().
 *
 * Returns an empty string when the name has no slug-able characters (for
 * example a name written entirely in Cyrillic, CJK, or emoji), so callers must
 * decide on their own fallback.
 */
export function toSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(
      /[\u0142\u00f8\u0111\u0127\u0131\u0167\u00e6\u0153\u00df\u00f0\u00fe]/g,
      (char) => nonDecomposableLatin[char as keyof typeof nonDecomposableLatin],
    )
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Latin letters that NFD leaves untouched because the mark is part of the glyph
 * rather than a combining character. Values match Postgres' unaccent rules so
 * runtime slugs and migration-backfilled slugs agree. Lowercase only - callers
 * reach this after the string has already been lowercased.
 */
const nonDecomposableLatin = {
  ł: 'l',
  ø: 'o',
  đ: 'd',
  ħ: 'h',
  ı: 'i',
  ŧ: 't',
  æ: 'ae',
  œ: 'oe',
  ß: 'ss',
  ð: 'd',
  þ: 'th',
} as const;

/**
 * Base slug for a user, falling back to `user` when the name yields nothing
 * slug-able. The caller is still responsible for making the value unique.
 */
export function toUserSlugBase(name: string | null | undefined): string {
  return toSlug(name ?? '') || 'user';
}
