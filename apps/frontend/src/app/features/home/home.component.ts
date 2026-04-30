import { Component } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
@Component({
  standalone: true,
  selector: 'app-home',
  imports: [HlmCardImports, HlmButtonImports, HlmBadgeImports],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
