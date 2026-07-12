import { Component, input, output } from '@angular/core';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBookAlert, lucidePlus } from '@ng-icons/lucide';

@Component({
  selector: 'app-empty-list',
  imports: [HlmButton, HlmEmptyImports, NgIcon],
  providers: [provideIcons({ lucideBookAlert, lucidePlus })],
  templateUrl: './empty-list.component.html',
})
export class EmptyListComponent {
  readonly title = input<string>('No items found');
  readonly description = input<string>(
    'There are no items to display at this time.',
  );
  readonly createButtonLabel = input<string>('Create Item');
  readonly createButtonClick = output<void>();

  onCreateClick(): void {
    this.createButtonClick.emit();
  }
}
