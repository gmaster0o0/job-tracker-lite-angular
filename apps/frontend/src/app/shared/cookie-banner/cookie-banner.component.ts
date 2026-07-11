import { Component, inject } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { CookieConsentService } from '../../features/settings/privacy-settings/cookie-managment/cookie-concent.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-cookie-banner',
  imports: [HlmButtonImports, HlmCardImports, TranslocoModule],
  templateUrl: './cookie-banner.component.html',
})
export class CookieBannerComponent {
  cookieService = inject(CookieConsentService);

  acceptCookies() {
    this.cookieService.saveConsent('accepted');
  }

  rejectCookies() {
    this.cookieService.saveConsent('rejected');
  }

  openDetailedSettings() {
    this.cookieService.openDetailedSettings();
  }
}
