import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type MainMenuItem = {
  readonly label: string;
  readonly description: string;
  readonly path: string;
};

@Component({
  standalone: true,
  selector: 'app-main-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './main-menu.component.html',
})
export class MainMenuComponent {
  protected readonly items: readonly MainMenuItem[] = [
    { label: 'Jobs', description: 'Coming soon.', path: '/jobs' },
    { label: 'Profile', description: 'Coming soon.', path: '/profile' },
    { label: 'Settings', description: 'Coming soon.', path: '/settings' },
    { label: 'About', description: 'Coming soon.', path: '/about' },
  ];
}
