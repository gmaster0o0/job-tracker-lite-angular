import { effect, inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private _transloco = inject(TranslocoService);

  readonly currentLang = signal(this._transloco.getActiveLang());
  constructor() {
    effect(() => {
      localStorage.setItem('user-lang', this.currentLang());
    });
  }
  setLanguage(lang: string) {
    this._transloco.setActiveLang(lang);
    this.currentLang.set(lang);
    localStorage.setItem('user-lang', lang);
  }
}
