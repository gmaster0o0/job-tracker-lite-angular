import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainMenuComponent } from './main-menu.component';
import { MainMenuHarness } from './main-menu.harness';

const noop = () => {
  //emptsy function for matchMedia event listeners
};

function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: noop,
      removeListener: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => true,
    }),
  });
}

describe('MainMenuComponent', () => {
  beforeAll(() => mockMatchMedia());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MainMenuComponent],
    }).compileComponents();
  });

  it('should render the main menu items', async () => {
    const fixture = TestBed.createComponent(MainMenuComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      MainMenuHarness,
    );

    expect(await harness.getLinkCount()).toBe(4);
    expect(await harness.getLinkLabels()).toEqual([
      'Jobs',
      'Profile',
      'Settings',
      'About',
    ]);
  });

  it('should include a link to /jobs', async () => {
    const fixture = TestBed.createComponent(MainMenuComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      MainMenuHarness,
    );

    expect(await harness.hasLinkTo('/jobs')).toBe(true);
    expect((await harness.getLinkLabels())[0]).toBe('Jobs');
  });
});
