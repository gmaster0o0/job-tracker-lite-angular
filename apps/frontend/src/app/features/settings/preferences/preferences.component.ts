import { Component } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AppearanceComponent } from '../appearance/appearance.component';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [HlmButtonImports, AppearanceComponent],
  templateUrl: './preferences.component.html',
})
export class PreferencesComponent {}
