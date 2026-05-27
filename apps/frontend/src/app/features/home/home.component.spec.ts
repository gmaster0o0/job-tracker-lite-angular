import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HomeHarness } from './home.harness';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('HomeComponent', () => {
  let harness: HomeHarness;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, getTranslocoModule()],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomeComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      HomeHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });

  it('should render all 3 main feature cards', async () => {
    const cardCount = await harness.getHomeCardCount();
    expect(cardCount).toBe(3);
  });

  it('should pass correct datas to the Profile card', async () => {
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
