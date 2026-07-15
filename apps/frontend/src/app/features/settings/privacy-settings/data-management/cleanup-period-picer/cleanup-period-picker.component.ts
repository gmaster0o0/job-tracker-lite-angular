import { Component, computed, signal } from '@angular/core';
import { form, submit } from '@angular/forms/signals';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSliderImports } from '@spartan-ng/helm/slider';

interface FilterModel {
  volume: number[];
}

@Component({
  selector: 'app-cleanup-period-picker',
  imports: [HlmSliderImports, HlmButtonImports, HlmFieldImports],
  templateUrl: './cleanup-period-picker.component.html',
})
export class CleanupPeriodPickerComponent {
  protected readonly filterModel = signal<FilterModel>({ volume: [20] });
  protected readonly filterForm = form(this.filterModel);

  // Computed signal, ami mindig újraszámolódik, ha a slider értéke változik
  protected readonly explanationText = computed(() => {
    const currentValue = this.filterForm.volume().value()[0]; // Mivel tömböt ad vissza a slider

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
    submit(this.filterForm, async () => {
      const selectedValue = this.filterModel().volume[0];
      console.log('Backend API hívás ezzel az értékkel:', selectedValue);
      // Itt indíthatod el az openConfirmationModal(selectedValue) logikát!
    });
  }
}
