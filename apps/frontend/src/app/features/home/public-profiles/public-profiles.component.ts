import { Component } from '@angular/core';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { NgIcon } from '@ng-icons/core';
import { provideIcons } from '@ng-icons/core';
import { lucideGithub, lucideLinkedin } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmButtonImports } from '@spartan-ng/helm/button';

interface PublicProfile {
  name: string;
  linkedInUrl: string;
  githubUrl: string;
}

@Component({
  standalone: true,
  selector: 'app-public-profiles',
  imports: [
    TranslocoModule,
    HlmCardImports,
    HlmIconImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideGithub, lucideLinkedin })],
  templateUrl: './public-profiles.component.html',
})
export class PublicProfilesComponent {
  readonly title = translateSignal('home.landing.publicProfiles.title');
  readonly subtitle = translateSignal('home.landing.publicProfiles.subtitle');

  readonly profiles: PublicProfile[] = [
    {
      name: 'Kovacs Janos',
      linkedInUrl: 'https://linkedin.com/in/kovacsj',
      githubUrl: 'https://github.com/kovacsj',
    },
    {
      name: 'Szabo Anna',
      linkedInUrl: 'https://linkedin.com/in/szaboanna',
      githubUrl: 'https://github.com/szaboanna',
    },
    {
      name: 'Nagy Peter',
      linkedInUrl: 'https://linkedin.com/in/nagypeter',
      githubUrl: 'https://github.com/nagypeter',
    },
  ];
}
