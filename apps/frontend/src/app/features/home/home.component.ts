import { Component, TemplateRef, ViewChild } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HomeCardComponent } from './home-card/home-card.component';
import { lucideBriefcase, lucideSettings, lucideUser } from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';

export interface HomeCard {
  title: string;
  description: string;
  link: string;
  iconName: string;
  iconBgClass: string;
}

@Component({
  standalone: true,
  selector: 'app-home',
  providers: [provideIcons({ lucideBriefcase, lucideUser, lucideSettings })],
  imports: [
    HlmCardImports,
    HlmButtonImports,
    HomeCardComponent,
    HlmIconImports,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  @ViewChild('jobsIcon', { static: true }) jobsIcon!: TemplateRef<void>;
  @ViewChild('profileIcon', { static: true }) profileIcon!: TemplateRef<void>;
  @ViewChild('settingsIcon', { static: true }) settingsIcon!: TemplateRef<void>;

  readonly homeCards: HomeCard[] = [
    {
      title: 'Jobs',
      description: 'Manage your job applications and track progress.',
      link: '/jobs',
      iconName: 'jobs',
      iconBgClass: 'bg-blue-100',
    },
    {
      title: 'Profile',
      description: 'Update your public profile and manage your CV.',
      link: '/profile',
      iconName: 'profile',
      iconBgClass: 'bg-purple-100',
    },
    {
      title: 'Settings',
      description: 'Configure your preferences and account settings.',
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
