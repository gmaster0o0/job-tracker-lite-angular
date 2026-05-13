import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

export const I18N_PATH = new InjectionToken<string>('I18N_PATH');

@Injectable({ providedIn: 'root' })
export class SharedTranslocoLoader implements TranslocoLoader {
  private http = inject(HttpClient);
  private path = inject(I18N_PATH, { optional: true }) ?? '/assets/i18n/';

  getTranslation(lang: string) {
    return this.http.get<Translation>(`${this.path}${lang}.json`);
  }
}
