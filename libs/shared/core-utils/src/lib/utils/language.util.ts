import {
  supportLangSchema,
  SupportLang,
} from '@job-tracker-lite-angular/schemas';
/**
 *
 * @param url
 * @param paramName
 * @param fallback - fallback language
 * @returns
 */
export function getLanguageFromUrl(
  url: string,
  paramName = 'language',
  fallback: SupportLang = 'en',
): SupportLang {
  try {
    const parsed = new URL(url);
    const result = supportLangSchema.safeParse(
      parsed.searchParams.get(paramName),
    );
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}

export function setLanguageOnUrl(
  url: URL,
  lang: SupportLang,
  paramName = 'language',
): void {
  url.searchParams.set(paramName, lang);
}
