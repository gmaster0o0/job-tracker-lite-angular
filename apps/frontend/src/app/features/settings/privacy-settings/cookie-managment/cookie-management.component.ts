import { Component, inject } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { lucideSettings2 } from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { CookieConsentService } from './cookie-concent.service';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-cookie-management',
  standalone: true,
  imports: [
    HlmTypographyImports,
    HlmButtonImports,
    HlmIconImports,
    TranslocoModule,
  ],
  providers: [provideIcons({ lucideSettings2 })],
  templateUrl: './cookie-management.component.html',
})
export class CookieManagementComponent {
  private readonly cookieConsentService = inject(CookieConsentService);

  onOpenCookieSettings() {
    this.cookieConsentService.openDetailedSettings();
  }
}
