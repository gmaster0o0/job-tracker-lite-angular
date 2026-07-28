import { Component, computed, inject } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideGlobe } from '@ng-icons/lucide';
import { UserPreferencesService } from '@job-tracker-lite-angular/frontend-data-access';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import { HlmSelectImports } from '@spartan-ng/helm/select';

interface LangOption {
  readonly value: string;
  readonly label: () => string;
}

@Component({
  selector: 'app-language',
  imports: [HlmCardImports, HlmIconImports, HlmSelectImports, TranslocoModule],
  templateUrl: './language.component.html',
  providers: [provideIcons({ lucideGlobe })],
})
export class LanguageComponent {
  preferences = inject(UserPreferencesService);
  formId = 'language-form';

  protected readonly languageOptions: readonly LangOption[] = [
    { value: 'en', label: () => 'English/EN' },
    { value: 'hu', label: () => 'Magyar/HU' },
    { value: 'system', label: translateSignal('preferences.language.system') },
  ];

  protected readonly currentLangValue = computed(() =>
    this.languageOptions.find(
      (opt) => opt.value === this.preferences.language(),
    ),
  );

  handleLangChange(newLang: LangOption | null | undefined) {
    if (newLang) {
      this.preferences.setLanguage(newLang.value);
    }
  }

  protected readonly languageItemToString = (option: LangOption): string =>
    option.label();
}
