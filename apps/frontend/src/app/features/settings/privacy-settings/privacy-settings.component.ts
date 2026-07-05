import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { DataManagementComponent } from './data-management/data-management.component';
import { CookieManagementComponent } from './cookie-managment/cookie-management.component';
import { VisibilityManagementComponent } from './visbility-managment/visibility-management.component';
import { provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';

@Component({
  selector: 'app-privacy-settings',
  standalone: true,
  imports: [
    TranslocoModule,
    DataManagementComponent,
    CookieManagementComponent,
    VisibilityManagementComponent,
    HlmButtonImports,
    HlmAlertImports,
    HlmIconImports,
    HlmTypographyImports,
    HlmSeparatorImports,
  ],
  providers: [provideIcons({ lucideTrash2 })],
  templateUrl: './privacy-settings.component.html',
})
export class PrivacySettingsComponent {}
