import { Component, computed, inject } from '@angular/core';
import { HlmCardImports } from 'spartan/ui/helm';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideGlobe } from '@ng-icons/lucide';
import { LanguageService } from '@job-tracker-lite-angular/frontend-data-access';
import { TranslocoModule } from '@jsverse/transloco';
import { HlmSelectImports } from '@spartan-ng/helm/select';

interface LangOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-language',
  imports: [HlmCardImports, HlmIconImports, HlmSelectImports, TranslocoModule],
  templateUrl: './language.component.html',
  providers: [provideIcons({ lucideGlobe })],
})
export class LanguageComponent {
  languageService = inject(LanguageService);
  formId = 'language-form';

  protected readonly languageOptions: readonly LangOption[] = [
    { value: 'en', label: 'English' },
    { value: 'hu', label: 'Magyar' },
  ] as const;

  protected readonly currentLangValue = computed(() =>
    this.languageOptions.find(
      (opt) => opt.value === this.languageService.currentLang(),
    ),
  );

  handleLangChange(newLang: LangOption | null | undefined) {
    console.log('Selected language:', newLang);
    if (newLang) {
      this.languageService.setLanguage(newLang.value);
    }
  }
}
