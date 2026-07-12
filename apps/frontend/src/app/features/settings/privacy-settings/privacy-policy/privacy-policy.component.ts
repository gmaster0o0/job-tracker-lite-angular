import { Component, effect, input, output, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucideShieldCheck } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [
    TranslocoModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmTypographyImports,
    NgIcon,
    RouterLink,
  ],
  providers: [provideIcons({ lucideShieldCheck })],
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicyComponent {
  open = input<boolean>(false);
  closed = output<void>();

  protected readonly state = signal<'open' | 'closed'>('closed');

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
}
