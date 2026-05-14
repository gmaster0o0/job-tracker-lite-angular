import { Component, computed, inject } from '@angular/core';
import { HlmCardImports } from 'spartan/ui/helm';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideGlobe } from '@ng-icons/lucide';
import { SettingsService } from '@job-tracker-lite-angular/frontend-data-access';
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
  settingsService = inject(SettingsService);
  formId = 'dateformat-form';

  protected readonly dateFormatOptions: readonly DateFormatOption[] = [
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
    { value: 'YYYY-MM-DD', label: 'ÉÉÉÉ-HH-NN' },
  ] as const;

  protected readonly currentDateFormatValue = computed(() =>
    this.dateFormatOptions.find(
      (opt) => opt.value === this.settingsService.dateFormat,
    ),
  );

  handleDateFormatChange(newDateFormat: DateFormatOption | null | undefined) {
    if (newDateFormat) {
      this.settingsService.dateFormat = newDateFormat.value;
    }
  }
}
