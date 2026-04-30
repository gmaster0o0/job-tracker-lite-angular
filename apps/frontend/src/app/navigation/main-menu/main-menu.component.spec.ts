import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainMenuComponent } from './main-menu.component';

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

    const links = fixture.nativeElement.querySelectorAll('a[href]');
    expect(links.length).toBe(4);

    const labels = Array.from(links as HTMLAnchorElement[]).map((link) =>
      link.querySelector('span')?.textContent?.trim(),
    );
    expect(labels).toEqual(['Jobs', 'Profile', 'Settings', 'About']);
  });

  it('should include a link to /jobs', async () => {
    const fixture = TestBed.createComponent(MainMenuComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const jobsLink = fixture.nativeElement.querySelector(
      'a[href="/jobs"]',
    ) as HTMLAnchorElement | null;
    expect(jobsLink).toBeTruthy();
    expect(jobsLink?.querySelector('span')?.textContent?.trim()).toBe('Jobs');
  });
});
