import { Component, effect, input, output, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { provideIcons } from '@ng-icons/core';
import { lucideShieldCheck } from '@ng-icons/lucide';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [
    TranslocoModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmTypographyImports,
  ],
  providers: [provideIcons({ lucideShieldCheck })],
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicyComponent {
  // route-vezérelt input: true, ha az URL szerint nyitva kell lennie
  open = input<boolean>(false);
  // kifelé jelezzük, ha bezárult (hogy a szülő tudja frissíteni az URL-t)
  closed = output<void>();

  // belső, "single source of truth" state a dialógusnak
  protected readonly state = signal<'open' | 'closed'>('closed');

  constructor() {
    // amikor a route input változik, szinkronban tartjuk a belső state-et
    effect(() => {
      console.log(this.open());
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
