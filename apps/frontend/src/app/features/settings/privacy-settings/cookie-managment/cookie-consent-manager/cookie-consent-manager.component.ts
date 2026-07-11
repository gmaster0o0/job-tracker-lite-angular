import { Component, inject, signal } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideCookie } from '@ng-icons/lucide';
import { CookiePreferences } from '../cookie-consent.types';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

@Component({
  selector: 'app-cookie-consent-manager',
  imports: [
    HlmTypographyImports,
    HlmDialogImports,
    HlmSwitchImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmIconImports,
    HlmBadgeImports,
  ],
  providers: [provideIcons({ lucideCookie })],
  standalone: true,
  templateUrl: './cookie-consent-manager.component.html',
  host: {
    class: 'flex flex-col gap-6',
  },
})
export class CookieConsentManager {
  private readonly dialogRef =
    inject<BrnDialogRef<CookiePreferences>>(BrnDialogRef);
  private readonly context = injectBrnDialogContext<{
    consent: CookiePreferences;
  }>();

  protected save(): void {
    this.dialogRef.close({
      essential: true,
    });
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
