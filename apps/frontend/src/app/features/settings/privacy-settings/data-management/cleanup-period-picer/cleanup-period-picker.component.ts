import { Component, computed, output, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSliderImports } from '@spartan-ng/helm/slider';

@Component({
  selector: 'app-cleanup-period-picker',
  imports: [HlmSliderImports, HlmButtonImports, HlmFieldImports],
  templateUrl: './cleanup-period-picker.component.html',
  styleUrls: ['./cleanup-period-picker.component.scss'],
})
export class CleanupPeriodPickerComponent {
  // Cleanup request from the parent component, which will be emitted when the user submits the form.
  readonly cleanupRequested = output<Date | null>();

  readonly formModel = signal({
    period: [0],
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

  // Computed signal, ami mindig újraszámolódik, ha a slider értéke változik
  protected readonly explanationText = computed(() => {
    const currentValue = this.filterForm.period().value()?.[0] ?? 0; // Mivel tömböt ad vissza a slider

    switch (currentValue) {
      case 0:
        return 'A 6 hónapnál régebbi jelentkezéseid, valamint a hozzájuk tartozó jegyzetek és névjegyek törlődnek.';
      case 10:
        return 'A 3 hónapnál régebbi jelentkezéseid, valamint a hozzájuk tartozó jegyzetek és névjegyek törlődnek.';
      case 20:
        return 'Az 1 hónapnál régebbi adatok törlődnek. A legutóbbi 30 napos aktivitásod biztonságban megmarad.';
      case 30:
        return 'Figyelem! Csak az elmúlt 2 hétben létrehozott adataidat tartjuk meg, minden ennél régebbit törlünk.';
      case 40:
        return 'Szigorú tisztítás: kizárólag a legfrissebb, 1 hétnél nem régebbi adataid maradnak meg.';
      case 50:
        return 'RENDKÍVÜL VESZÉLYES! Az összes felvitt jelentkezésed, jegyzeted és kapcsolatod azonnal kitöröljük.';
      default:
        return 'Válaszd ki, milyen időszaknál régebbi adatokat szeretnél véglegesen törölni.';
    }
  });

  formatTick = (value: number): string => {
    switch (value) {
      case 0:
        return '6 hónap';
      case 10:
        return '3 hónap';
      case 20:
        return '1 hónap';
      case 30:
        return '2 hét';
      case 40:
        return '1 hét';
      case 50:
        return 'Összes';
      default:
        return `${value}`;
    }
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
      case 0:
        now.setMonth(now.getMonth() - 6);
        return now;
      case 10:
        now.setMonth(now.getMonth() - 3);
        return now;
      case 20:
        now.setMonth(now.getMonth() - 1);
        return now;
      case 30:
        now.setDate(now.getDate() - 14);
        return now;
      case 40:
        now.setDate(now.getDate() - 7);
        return now;
      case 50:
        return null; //no cutoff date, delete all data
      default:
        now.setMonth(now.getMonth() - 6);
        return now;
    }
  }
}
