import { Injectable, effect, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private mediaQuery =
    this.isBrowser && typeof window?.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  defaultTheme = this.getStoredTheme();
  public readonly theme = signal<Theme>(this.defaultTheme);

  constructor() {
    effect(() => {
      const currentTheme = this.theme();
      if (this.isBrowser) {
        localStorage.setItem('theme', currentTheme);
        this.applyTheme(currentTheme);
      }
    });

    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', () => {
        if (this.theme() === 'system') {
          this.applyTheme('system');
        }
      });
    }

    if (this.isBrowser) {
      this.applyTheme(this.defaultTheme);
    }
  }

  private getStoredTheme(): Theme {
    if (!this.isBrowser) return 'light';
    return (localStorage.getItem('theme') as Theme) || 'light';
  }

  private applyTheme(theme: Theme): void {
    if (!this.isBrowser) return;

    const root = document.documentElement;
    const isDark =
      theme === 'dark' || (theme === 'system' && this.mediaQuery?.matches);

    root.classList.toggle('dark', isDark);
  }
}
