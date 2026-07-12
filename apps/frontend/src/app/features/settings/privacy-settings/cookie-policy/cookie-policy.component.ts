import { Component, inject } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { SlicePipe } from '@angular/common';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import { lucideScrollText } from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
@Component({
  selector: 'app-cookie-policy',
  imports: [
    HlmTypographyImports,
    HlmDialogImports,
    HlmButtonImports,
    HlmTableImports,
    SlicePipe,
    TranslocoModule,
    HlmIconImports,
  ],
  providers: [provideIcons({ lucideScrollText })],
  templateUrl: './cookie-policy.component.html',
})
export class CookiePolicyComponent {
  protected readonly cookies = [
    {
      name: 'better-auth.session_token',
      description: translateSignal(
        'settings.cookiePolicy.cookies.description.sessionToken',
      ),
      duration: translateSignal(
        'settings.cookiePolicy.cookies.duration.session',
      ),
    },
    {
      name: 'authjs.csrf-token / next-auth.csrf-token',
      description: translateSignal(
        'settings.cookiePolicy.cookies.description.csrfToken',
      ),
      duration: translateSignal(
        'settings.cookiePolicy.cookies.duration.session',
      ),
    },
    {
      name: 'XSRF-TOKEN',
      description: translateSignal(
        'settings.cookiePolicy.cookies.description.xsrfToken',
      ),
      duration: translateSignal(
        'settings.cookiePolicy.cookies.duration.session',
      ),
    },
    {
      name: 'authjs.callback-url',
      description: translateSignal(
        'settings.cookiePolicy.cookies.description.callbackUrl',
      ),
      duration: translateSignal(
        'settings.cookiePolicy.cookies.duration.session',
      ),
    },
  ];
}
