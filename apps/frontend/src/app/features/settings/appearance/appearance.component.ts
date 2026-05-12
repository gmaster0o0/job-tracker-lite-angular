import { Component, effect, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmCardImports } from 'spartan/ui/helm';
import { provideIcons } from '@ng-icons/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { lucideMonitor, lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { hlm } from '@spartan-ng/helm/utils';
import { ThemeService } from '@job-tracker-lite-angular/frontend-data-access';

export interface AppearanceCard {
  label: string;
  iconName: string;
  value: 'light' | 'dark' | 'system';
}

@Component({
  selector: 'app-appearance',
  imports: [
    HlmCardImports,
    HlmIconImports,
    HlmRadioGroupImports,
    HlmButtonImports,
    FormsModule,
  ],
  providers: [provideIcons({ lucideSun, lucideMoon, lucideMonitor })],
  standalone: true,
  templateUrl: './appearance.component.html',
})
export class AppearanceComponent {
  private themeService = inject(ThemeService);
  public appearance = model<'light' | 'dark' | 'system'>('light');

  constructor() {
    effect(
      () => {
        this.themeService.theme.set(this.appearance());
      },
      { allowSignalWrites: true },
    );
  }

  public readonly appearanceOptions: AppearanceCard[] = [
    { label: 'Light', iconName: 'lucideSun', value: 'light' },
    { label: 'Dark', iconName: 'lucideMoon', value: 'dark' },
    { label: 'System', iconName: 'lucideMonitor', value: 'system' },
  ];

  cardClass(optionValue: string) {
    const isSelected = this.appearance() === optionValue;
    return hlm(
      'relative flex flex-col items-center justify-center rounded-lg px-4 py-8 transition-all border-2 cursor-pointer',
      isSelected
        ? 'border-primary bg-accent/5 ring-2 ring-primary/10'
        : 'border-border bg-background hover:bg-accent/10',
    );
  }
}
