import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';

@Component({
  standalone: true,
  selector: 'app-edit-button',
  imports: [CommonModule, HlmButton, HlmIconImports, TranslocoModule],
  providers: [provideIcons({ lucidePencil })],
  templateUrl: './edit-button.component.html',
})
export class EditButtonComponent {
  readonly disabled = input(false);
  readonly edit = output<void>();
  readonly editLabel = input<string>('Edit');
}
