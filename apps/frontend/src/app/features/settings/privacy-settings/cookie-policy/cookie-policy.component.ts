import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { SlicePipe } from '@angular/common';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import { lucideScrollText } from '@ng-icons/lucide';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppDatePipe } from '@job-tracker-lite-angular/frontend-data-access';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [
    HlmTypographyImports,
    HlmDialogImports,
    HlmButtonImports,
    HlmTableImports,
    SlicePipe,
    TranslocoModule,
    NgIcon,
    AppDatePipe,
  ],
  providers: [provideIcons({ lucideScrollText })],
  templateUrl: './cookie-policy.component.html',
})
export class CookiePolicyComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  open = input<boolean>(false);
  closed = output<void>();

  protected readonly state = signal<'open' | 'closed'>('closed');
  // The last updated date for the cookie policy
  protected readonly lastUpdatedDate = '2026-07-12';

  constructor() {
    effect(() => {
      this.state.set(this.open() ? 'open' : 'closed');
    });
  }

  protected onStateChanged(newState: 'open' | 'closed'): void {
    this.state.set(newState);
    if (newState === 'closed') {
      this.closed.emit();
    }
  }

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

  protected onOpenRequested(): void {
    void this.router.navigate(['cookie-policy'], {
      relativeTo: this.route,
    });
  }
}
