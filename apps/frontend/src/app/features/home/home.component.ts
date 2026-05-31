import { Component, inject } from '@angular/core';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
import { HeroComponent } from './hero/hero.component';
import { LandingDashboardComponent } from './landing-dashboard/landing-dashboard.component';
import { PublicProfilesComponent } from './public-profiles/public-profiles.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [HeroComponent, LandingDashboardComponent, PublicProfilesComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly authSession = inject(AuthSessionService);
  protected readonly isAuthenticated = this.authSession.isAuthenticated;
}
