import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslocoModule, HlmCardImports],
  template: `
    <div class="container mx-auto max-w-4xl px-4 py-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold tracking-tight">
          {{ 'dashboard.title' | transloco }}
        </h1>
      </div>

      <hlm-card>
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'dashboard.moderationTitle' | transloco }}</h2>
          <p hlmCardDescription>
            {{ 'dashboard.moderationDescription' | transloco }}
          </p>
        </div>
        <div hlmCardContent class="py-8 text-center text-muted-foreground">
          {{ 'common.comingSoon' | transloco }}
        </div>
      </hlm-card>
    </div>
  `,
})
export class DashboardComponent {}
