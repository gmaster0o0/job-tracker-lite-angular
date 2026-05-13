import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';

import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { ContactsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { ContactListItemComponent } from '../contact-list-item/contact-list-item.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-contact-list',
  imports: [CommonModule, ContactListItemComponent, TranslocoModule],
  templateUrl: './contact-list.component.html',
})
export class ContactListComponent {
  private readonly jobsDataAccessService = inject(JobsDataAccessService);
  private readonly contactsDataAccessService = inject(
    ContactsDataAccessService,
  );

  readonly jobId = input.required<string>();
  readonly edit = output<ContactDto>();
  readonly remove = output<ContactDto>();

  protected readonly contactsResource =
    this.contactsDataAccessService.contactsResource;

  protected onEdit(contact: ContactDto): void {
    this.edit.emit(contact);
  }

  protected onRemove(contact: ContactDto): void {
    this.remove.emit(contact);
  }
}
