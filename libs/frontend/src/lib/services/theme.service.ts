import { Injectable, effect, signal } from '@angular/core';

type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  defaultTheme = (localStorage.getItem('theme') as Theme) || 'light';
  public readonly theme = signal<Theme>(this.defaultTheme);

  constructor() {
    effect(() => {
      const currentTheme = this.theme();
      localStorage.setItem('theme', currentTheme);

      this.applyTheme(currentTheme);
    });
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);
  }
}
