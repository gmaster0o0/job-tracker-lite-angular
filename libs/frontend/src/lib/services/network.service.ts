import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly isOnline = signal(this.isBrowser ? navigator.onLine : true);

  constructor() {
    if (!this.isBrowser) return;

    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }
}
