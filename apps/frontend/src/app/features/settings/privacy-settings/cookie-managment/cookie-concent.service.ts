import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
// cookie-consent.service.ts
@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  showBanner = signal<boolean>(localStorage.getItem('cookieConsent') === null);

  openDetailedSettings() {
    // Implement the logic to open the detailed settings dialog
    console.log('Opening detailed settings dialog...');
    // You can use a dialog service or any other method to open the dialog here
  }

  saveConsent(status: 'accepted' | 'rejected') {
    localStorage.setItem('cookieConsent', status);
    this.showBanner.set(false);
  }
}
