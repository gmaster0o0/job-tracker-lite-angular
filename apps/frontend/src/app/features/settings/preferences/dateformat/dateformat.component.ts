import { Component, computed, inject } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideGlobe } from '@ng-icons/lucide';
import { UserPreferencesService } from '@job-tracker-lite-angular/frontend-data-access';
import { TranslocoModule } from '@jsverse/transloco';
import { HlmSelectImports } from '@spartan-ng/helm/select';

interface DateFormatOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-dateformat',
  imports: [HlmCardImports, HlmIconImports, HlmSelectImports, TranslocoModule],
  templateUrl: './dateformat.component.html',
  providers: [provideIcons({ lucideGlobe })],
})
export class DateformatComponent {
  preferences = inject(UserPreferencesService);
  formId = 'dateformat-form';

  protected readonly dateFormatOptions: readonly DateFormatOption[] = [
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
    { value: 'YYYY-MM-DD', label: 'ÉÉÉÉ-HH-NN' },
  ] as const;

  protected readonly currentDateFormatValue = computed(() =>
    this.dateFormatOptions.find(
      (opt) => opt.value === this.preferences.dateFormat(),
    ),
  );

  handleDateFormatChange(newDateFormat: DateFormatOption | null | undefined) {
    if (newDateFormat) {
      this.preferences.setDateFormat(newDateFormat.value);
    }
  }
}
