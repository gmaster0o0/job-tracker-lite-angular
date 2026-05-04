import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { provideIcons } from '@ng-icons/core';
import {
  lucideMail,
  lucidePencil,
  lucidePhone,
  lucideTrash2,
  lucideUser,
} from '@ng-icons/lucide';

@Component({
  standalone: true,
  selector: 'app-contact-list-item',
  imports: [
    CommonModule,
    HlmCardImports,
    HlmButtonImports,
    HlmIconImports,
    HlmTooltipImports,
  ],
  providers: [
    provideIcons({
      lucideUser,
      lucideMail,
      lucidePhone,
      lucidePencil,
      lucideTrash2,
    }),
  ],
  templateUrl: './contact-list-item.component.html',
})
export class ContactListItemComponent {
  readonly contact = input.required<ContactDto>();

  readonly edit = output<ContactDto>();
  readonly remove = output<ContactDto>();

  protected onEdit(): void {
    this.edit.emit(this.contact());
  }

  protected onRemove(): void {
    this.remove.emit(this.contact());
  }
}
