import {
  Component,
  computed,
  input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { provideIcons } from '@ng-icons/core';
import { lucideSave, lucideLoader2, lucideRefreshCw } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { interval } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-submit-button',
  imports: [HlmButton, HlmIconImports, HlmTooltipImports],
  providers: [provideIcons({ lucideSave, lucideLoader2, lucideRefreshCw })],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './submit-button.component.html',
})
/**
 * SubmitButtonComponent is a reusable button component with built-in support for form submission,
 * loading state, and cooldown periods.
 */
export class SubmitButtonComponent {
  readonly formId = input.required<string>();
  readonly disabled = input(false);
  readonly isSubmitting = input(false);
  readonly idleLabel = input.required<string>();
  readonly submittingLabel = input('Saving...');
  readonly idleIcon = input('lucideSave');
  /**
   * cooldownUntil: submit spam prevention, if set, the button will be disabled until the specified date/time.
   * cooldownLabel: a function that takes the remaining seconds and returns a string to display as the button label during cooldown.
   * cooldownTooltip: a string to display as a tooltip during cooldown.
   */
  readonly cooldownUntil = input<Date | null>(null);
  readonly cooldownLabel = input<((remainingSeconds: number) => string) | null>(
    null,
  );
  readonly cooldownTooltip = input<string | null>(null);

  private readonly now = signal(new Date());

  protected readonly remainingCooldownSeconds = computed(() => {
    const until = this.cooldownUntil();
    if (!until) {
      return 0;
    }
    const remainingMs = until.getTime() - this.now().getTime();
    return Math.max(0, Math.ceil(remainingMs / 1000));
  });

  protected readonly isOnCooldown = computed(
    () => this.remainingCooldownSeconds() > 0,
  );

  protected readonly isDisabled = computed(
    () => this.disabled() || this.isSubmitting() || this.isOnCooldown(),
  );

  protected readonly label = computed(() => {
    const cooldownLabel = this.cooldownLabel();
    if (this.isOnCooldown() && cooldownLabel) {
      return cooldownLabel(this.remainingCooldownSeconds());
    }
    return this.idleLabel();
  });

  protected readonly showCooldownTooltip = computed(
    () => this.isOnCooldown() && !!this.cooldownTooltip(),
  );

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.now.set(new Date()));
  }
}
