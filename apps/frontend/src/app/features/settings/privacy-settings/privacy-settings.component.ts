import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { CookieManagementComponent } from './cookie-managment/cookie-management.component';
import { DataManagementComponent } from './data-management/data-management.component';
import { DeleteAccountComponent } from './delete-account/delete-account.component';
import { VisibilityManagementComponent } from './visbility-managment/visibility-management.component';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

@Component({
  selector: 'app-privacy-settings',
  standalone: true,
  imports: [
    TranslocoModule,
    DataManagementComponent,
    CookieManagementComponent,
    VisibilityManagementComponent,
    HlmSeparatorImports,
    DeleteAccountComponent,
    HlmTypographyImports,
  ],
  templateUrl: './privacy-settings.component.html',
})
export class PrivacySettingsComponent {}
