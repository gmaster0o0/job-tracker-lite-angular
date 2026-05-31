import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LandingDashboardComponent } from './landing-dashboard.component';
import { LandingDashboardHarness } from './landing-dashboard.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('LandingDashboardComponent', () => {
  let harness: LandingDashboardHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingDashboardComponent, getTranslocoModule()],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(LandingDashboardComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      LandingDashboardHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });

  it('should render all 3 main feature cards', async () => {
    expect(await harness.getHomeCardCount()).toBe(3);
  });

  it('should pass correct data to the Profile card', async () => {
    const profileCard = await harness.getCardByTitle('Profile');

    expect(await profileCard?.getDescription()).toBe(
      'Update your public profile and manage your CV.',
    );
    expect(await profileCard?.getCardLink()).toBe('/profile');
    expect(await profileCard?.getIconBackgroundClass()).toContain(
      'bg-purple-100',
    );
  });
});
