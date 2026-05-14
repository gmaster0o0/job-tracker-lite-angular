import { effect, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly currentDateFormat = signal('DD-MM-YYYY');

  constructor() {
    const saved = localStorage.getItem('setttings');
    if (saved) {
      this.currentDateFormat.set(saved);
    }

    effect(() => {
      localStorage.setItem('setttings', this.currentDateFormat());
    });
  }

  public get dateFormat(): string {
    return this.currentDateFormat();
  }

  public set dateFormat(newDateFormat: string) {
    this.currentDateFormat.set(newDateFormat);
    localStorage.setItem('setttings', newDateFormat);
  }
}
