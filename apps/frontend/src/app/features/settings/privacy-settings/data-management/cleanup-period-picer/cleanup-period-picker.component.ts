import { Component, computed, output, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSliderImports } from '@spartan-ng/helm/slider';
import { translateSignal, TranslocoModule } from '@jsverse/transloco';

export type CleanupSliderValue = 0 | 10 | 20 | 30 | 40 | 50;

@Component({
  selector: 'app-cleanup-period-picker',
  imports: [
    HlmSliderImports,
    HlmButtonImports,
    HlmFieldImports,
    TranslocoModule,
  ],
  templateUrl: './cleanup-period-picker.component.html',
  styleUrls: ['./cleanup-period-picker.component.scss'],
})
export class CleanupPeriodPickerComponent {
  // Cleanup request from the parent component, which will be emitted when the user submits the form.
  readonly cleanupRequested = output<Date | null>();

  readonly formModel = signal({
    period: [10],
  });

  readonly filterForm = form(this.formModel);

  /**
   * Determines the color class for the slider based on the selected value.
   * - Green for values less than 20 (6 and 3 months)
   * - Yellow for values equal to 20 or 30 (1 month and 2 weeks)
   * - Red for values greater than 30 (1 week and All)
   * This computed signal will automatically update whenever the slider value changes.
   */
  readonly sliderColorClass = computed(() => {
    const value = this.filterForm.period().value()?.[0] ?? 0;

    if (value < 20) {
      return 'slider-green';
    }
    if (value === 20 || value === 30) {
      return 'slider-yellow';
    }
    return 'slider-red';
  });

  private readonly textObject: Record<
    number,
    { explanation: () => string; tick: () => string }
  > = {
    0: {
      explanation: translateSignal(
        'privacySettings.datamanagement.cleanupPeriod.explanation.1year',
      ),
      tick: translateSignal(
        'privacySettings.datamanagement.cleanupPeriod.tick.1year',
      ),
    },
    10: {
      explanation: translateSignal(
        'privacySettings.datamanagement.cleanupPeriod.explanation.6months',
      ),
      tick: translateSignal(
        'privacySettings.datamanagement.cleanupPeriod.tick.6months',
      ),
    },
    20: {
      explanation: translateSignal(
        'privacySettings.datamanagement.cleanupPeriod.explanation.3months',
      ),
      tick: translateSignal(
        'privacySettings.datamanagement.cleanupPeriod.tick.3months',
      ),
    },
    30: {
      explanation: translateSignal(
        'privacySettings.datamanagement.cleanupPeriod.explanation.1month',
      ),
      tick: translateSignal(
        'privacySettings.datamanagement.cleanupPeriod.tick.1month',
      ),
    },
    40: {
      explanation: translateSignal(
        'privacySettings.datamanagement.cleanupPeriod.explanation.2weeks',
      ),
      tick: translateSignal(
        'privacySettings.datamanagement.cleanupPeriod.tick.2weeks',
      ),
    },
    50: {
      explanation: translateSignal(
        'privacySettings.datamanagement.cleanupPeriod.explanation.all',
      ),
      tick: translateSignal(
        'privacySettings.datamanagement.cleanupPeriod.tick.all',
      ),
    },
  };

  protected readonly explanationText = computed(() => {
    const currentValue = this.filterForm.period().value()?.[0] ?? 0;
    return this.textObject[currentValue]?.explanation() ?? '';
  });

  formatTick = (value: number): string => {
    return this.textObject[value]?.tick() ?? '';
  };

  onSubmit(event: Event) {
    event.preventDefault();
    const rawValue = this.filterForm.period().value()?.[0] ?? 0;
    const cutoffDate = this.calculateCutoffDate(rawValue);
    this.cleanupRequested.emit(cutoffDate);
  }

  private calculateCutoffDate(value: number): Date | null {
    const now = new Date();

    switch (value) {
      case 0: // 1 year
        now.setMonth(now.getMonth() - 12);
        return now;
      case 10: // 6 months
        now.setMonth(now.getMonth() - 6);
        return now;
      case 20: // 3 months
        now.setMonth(now.getMonth() - 3);
        return now;
      case 30: // 1 month
        now.setMonth(now.getMonth() - 1);
        return now;
      case 40: // 2 week
        now.setDate(now.getDate() - 14);
        return now;
      case 50: // all
        return null;
      default:
        now.setMonth(now.getMonth() - 12);
        return now;
    }
  }
}
