import { Component, TemplateRef, ViewChild } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HomeCardComponent } from '../home-card/home-card.component';
import { lucideBriefcase, lucideSettings, lucideUser } from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { translateSignal, TranslocoModule } from '@jsverse/transloco';
import { HomeCard } from '../home-card.model';

@Component({
  standalone: true,
  selector: 'app-landing-dashboard',
  providers: [provideIcons({ lucideBriefcase, lucideUser, lucideSettings })],
  imports: [HlmCardImports, HomeCardComponent, HlmIconImports, TranslocoModule],
  templateUrl: './landing-dashboard.component.html',
})
export class LandingDashboardComponent {
  @ViewChild('jobsIcon', { static: true }) jobsIcon!: TemplateRef<void>;
  @ViewChild('profileIcon', { static: true }) profileIcon!: TemplateRef<void>;
  @ViewChild('settingsIcon', { static: true }) settingsIcon!: TemplateRef<void>;

  readonly homeCards: HomeCard[] = [
    {
      title: translateSignal('common.jobs'),
      description: translateSignal('home.jobs.description'),
      link: '/jobs',
      iconName: 'jobs',
      iconBgClass: 'bg-blue-100',
    },
    {
      title: translateSignal('common.profile'),
      description: translateSignal('home.profile.description'),
      link: '/profile',
      iconName: 'profile',
      iconBgClass: 'bg-purple-100',
    },
    {
      title: translateSignal('common.settings'),
      description: translateSignal('home.settings.description'),
      link: '/settings',
      iconName: 'settings',
      iconBgClass: 'bg-slate-100',
    },
  ];

  getIcon(name: string): TemplateRef<void> {
    const icons: Record<string, TemplateRef<void>> = {
      jobs: this.jobsIcon,
      profile: this.profileIcon,
      settings: this.settingsIcon,
    };
    return icons[name];
  }
}
