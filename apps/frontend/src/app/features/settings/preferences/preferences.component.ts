import { Component } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AppearanceComponent } from '../appearance/appearance.component';
import { LanguageComponent } from '../language/language.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    HlmButtonImports,
    AppearanceComponent,
    LanguageComponent,
    TranslocoModule,
  ],
  templateUrl: './preferences.component.html',
})
export class PreferencesComponent {}
