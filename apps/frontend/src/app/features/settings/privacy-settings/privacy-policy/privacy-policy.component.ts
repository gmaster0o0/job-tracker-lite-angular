import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { lucideShieldCheck } from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-privacy-policy',
  imports: [
    HlmTypographyImports,
    HlmDialogImports,
    HlmButtonImports,
    HlmTableImports,
    TranslocoModule,
    HlmIconImports,
  ],
  providers: [provideIcons({ lucideShieldCheck })],
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicyComponent {}
