import { Component, computed, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { CookieManagementComponent } from './cookie-managment/cookie-management.component';
import { DataManagementComponent } from './data-management/data-management.component';
import { DeleteAccountComponent } from './delete-account/delete-account.component';
import { VisibilityManagementComponent } from './visbility-managment/visibility-management.component';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

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
    CookiePolicyComponent,
    PrivacyPolicyComponent,
  ],
  templateUrl: './privacy-settings.component.html',
})
export class PrivacySettingsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly policyType = toSignal(
    this.route.url.pipe(map((segments) => segments[0]?.path ?? null)),
    { initialValue: null },
  );

  protected readonly activePolicy = computed(() => {
    const type = this.policyType();
    return type === 'privacy-policy' || type === 'cookie-policy' ? type : null;
  });

  protected onPolicyClosed(): void {
    this.router.navigate(['../'], { relativeTo: this.route, replaceUrl: true });
  }
}
