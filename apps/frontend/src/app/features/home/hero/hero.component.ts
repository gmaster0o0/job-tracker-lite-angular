import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBriefcase,
  lucideFileText,
  lucideUser,
  lucideLogIn,
  lucideUserPlus,
} from '@ng-icons/lucide';

interface HeroFeatureCard {
  title: () => string;
  description: () => string;
  iconName: 'lucideBriefcase' | 'lucideUser' | 'lucideFileText';
  iconClass: string;
  iconBgClass: string;
  comingSoon?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-hero',
  providers: [
    provideIcons({
      lucideBriefcase,
      lucideUser,
      lucideFileText,
      lucideLogIn,
      lucideUserPlus,
    }),
  ],
  imports: [
    RouterLink,
    TranslocoModule,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmIconImports,
  ],
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  readonly featureCards: HeroFeatureCard[] = [
    {
      title: translateSignal('home.landing.features.jobs.title'),
      description: translateSignal('home.landing.features.jobs.description'),
      iconName: 'lucideBriefcase',
      iconClass: 'text-blue-600',
      iconBgClass: 'bg-blue-100',
    },
    {
      title: translateSignal('home.landing.features.contacts.title'),
      description: translateSignal(
        'home.landing.features.contacts.description',
      ),
      iconName: 'lucideUser',
      iconClass: 'text-emerald-600',
      iconBgClass: 'bg-emerald-100',
    },
    {
      title: translateSignal('home.landing.features.notes.title'),
      description: translateSignal('home.landing.features.notes.description'),
      iconName: 'lucideFileText',
      iconClass: 'text-amber-700',
      iconBgClass: 'bg-amber-100',
    },
    {
      title: translateSignal('home.landing.features.coverLetter.title'),
      description: translateSignal(
        'home.landing.features.coverLetter.description',
      ),
      iconName: 'lucideFileText',
      iconClass: 'text-slate-600',
      iconBgClass: 'bg-slate-100',
      comingSoon: true,
    },
  ];
}
