/**
 * Strips diacritics before removing non-alphanumeric characters, so "Gábor"
 * becomes "gabor" rather than losing the accented letters outright. Returns
 * an empty string for names with no slug-able characters (all-CJK, all-emoji)
 * - callers must supply their own fallback.
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

// Letters NFD leaves untouched because the mark is part of the glyph, not a
// combining character. Matches Postgres' unaccent() so slugs agree either way.
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
