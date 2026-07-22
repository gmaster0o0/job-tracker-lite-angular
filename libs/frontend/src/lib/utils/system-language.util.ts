export function resolveSystemLanguage(
  availableLangs: readonly string[],
): string | null {
  const candidates = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const candidate of candidates) {
    const primary = candidate.split('-')[0].toLowerCase();
    if (availableLangs.includes(primary)) {
      return primary;
    }
  }

  return null;
}
