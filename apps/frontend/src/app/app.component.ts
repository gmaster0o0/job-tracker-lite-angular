import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToaster } from '@spartan-ng/helm/sonner';
import { CookieBannerComponent } from './shared/cookie-banner/cookie-banner.component';

@Component({
  standalone: true,
  imports: [RouterOutlet, CookieBannerComponent, HlmToaster],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './app.component.html',
})
export class AppComponent {}
