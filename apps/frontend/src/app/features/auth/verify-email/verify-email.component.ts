import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { ServerErrorAlertComponent } from '@job-tracker-lite-angular/frontend-shared';

@Component({
  standalone: true,
  selector: 'app-verify-email',
  imports: [
    CommonModule,
    RouterLink,
    HlmCardImports,
    HlmButtonImports,
    TranslocoModule,
    ServerErrorAlertComponent,
  ],
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly title = translateSignal('auth.verifyEmail.title');
  protected readonly subtitle = translateSignal('auth.verifyEmail.subtitle');

  protected readonly errorCode = signal<string | null>(
    this.route.snapshot.queryParamMap.get('error')?.toLowerCase() ?? null,
  );
}
