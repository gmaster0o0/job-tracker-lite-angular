import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainMenuComponent } from './main-menu.component';

describe('MainMenuComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MainMenuComponent],
    }).compileComponents();
  });

  it('should render the main menu items', () => {
    const fixture = TestBed.createComponent(MainMenuComponent);
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a[routerlink]');
    expect(links.length).toBe(4);

    const labels = Array.from(links).map((link: HTMLAnchorElement) =>
      link.textContent?.trim(),
    );
    expect(labels).toEqual(['Jobs', 'Profile', 'Settings', 'About']);
  });

  it('should include a link to /jobs', () => {
    const fixture = TestBed.createComponent(MainMenuComponent);
    fixture.detectChanges();

    const jobsLink = fixture.nativeElement.querySelector(
      'a[routerlink="/jobs"]',
    );
    expect(jobsLink).toBeTruthy();
    expect(jobsLink.textContent?.trim()).toBe('Jobs');
  });
});
