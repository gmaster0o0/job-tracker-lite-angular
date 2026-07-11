import { inject, Injectable, signal } from '@angular/core';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { CookieConsentManager } from './cookie-consent-manager/cookie-consent-manager.component';

import {
  CookiePreferences,
  DEFAULT_COOKIE_PREFERENCES,
} from './cookie-consent.types';

const STORAGE_KEY = 'cookieConsent';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly dialog = inject(HlmDialogService);

  showBanner = signal<boolean>(localStorage.getItem(STORAGE_KEY) === null);

  getConsent(): CookiePreferences {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COOKIE_PREFERENCES;

    try {
      const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
      return { ...DEFAULT_COOKIE_PREFERENCES, ...parsed, essential: true };
    } catch {
      return DEFAULT_COOKIE_PREFERENCES;
    }
  }

  openDetailedSettings() {
    const dialogRef = this.dialog.open(CookieConsentManager, {
      contentClass: 'sm:max-w-2xl w-[95vw]',
      context: {
        consent: this.getConsent(),
      },
    });

    dialogRef.closed$.subscribe((result) => {
      if (result) {
        this.savePreferences(result as CookiePreferences);
      }
    });
  }
  // status will be need for future use
  saveConsent(status: 'accepted' | 'rejected') {
    const consent: CookiePreferences = {
      essential: true,
    };
    this.savePreferences(consent);
  }

  private savePreferences(consent: CookiePreferences) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    this.showBanner.set(false);
  }
}
