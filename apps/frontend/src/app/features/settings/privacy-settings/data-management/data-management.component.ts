import { Component } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-data-management',
  standalone: true,
  imports: [HlmTypographyImports, TranslocoModule],
  templateUrl: './data-management.component.html',
})
export class DataManagementComponent {}
