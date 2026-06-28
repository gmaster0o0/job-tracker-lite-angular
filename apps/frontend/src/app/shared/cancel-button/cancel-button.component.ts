import { Component, input, output } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  standalone: true,
  selector: 'app-cancel-button',
  imports: [HlmButton],
  templateUrl: './cancel-button.component.html',
})
export class CancelButtonComponent {
  readonly disabled = input(false);
  readonly clicked = output<void>();
}
