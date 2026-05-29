import { SupportLang } from '@job-tracker-lite-angular/schemas';

//TODO  we need test for this
export function getLanguageFromResetUrl(url: string): SupportLang {
  try {
    const resetUrl = new URL(url);
    const callbackUrl = resetUrl.searchParams.get('callbackURL');

    if (!callbackUrl) {
      return 'en';
    }

    const decodedCallbackUrl = new URL(callbackUrl);
    return decodedCallbackUrl.searchParams.get('language') === 'hu'
      ? 'hu'
      : 'en';
  } catch {
    return 'en';
  }
}
