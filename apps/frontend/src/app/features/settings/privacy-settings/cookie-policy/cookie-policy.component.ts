import { Component } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { SlicePipe } from '@angular/common';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { TranslocoModule } from '@jsverse/transloco';
import { lucideScrollText } from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
@Component({
  selector: 'app-cookie-policy',
  imports: [
    HlmTypographyImports,
    HlmDialogImports,
    HlmButtonImports,
    HlmTableImports,
    SlicePipe,
    TranslocoModule,
    HlmIconImports,
  ],
  providers: [provideIcons({ lucideScrollText })],
  templateUrl: './cookie-policy.component.html',
})
export class CookiePolicyComponent {
  protected readonly cookies = [
    {
      name: 'better-auth.session_token',
      description: 'A felhasználói munkamenet azonosítására szolgál.',
      duration: 'Munkamenet függő',
    },
    {
      name: 'authjs.csrf-token / next-auth.csrf-token',
      description: 'Biztonsági süti, a CSRF-támadások megelőzésére szolgál.',
      duration: 'Munkamenet függő',
    },
    {
      name: 'XSRF-TOKEN',
      description: 'További biztonsági réteg az adatküldések védelmére.',
      duration: 'Munkamenet függő',
    },
    {
      name: 'authjs.callback-url',
      description:
        'A bejelentkezés utáni irányításhoz szükséges technikai adat.',
      duration: 'Munkamenet függő',
    },
  ];
}
