import { CommonModule } from '@angular/common';
import { Component, inject, input, output, effect } from '@angular/core';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';

import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { ContactListItemComponent } from '../contact-list-item/contact-list-item.component';

@Component({
  standalone: true,
  selector: 'app-contact-list',
  imports: [CommonModule, ContactListItemComponent],
  templateUrl: './contact-list.component.html',
})
export class ContactListComponent {
  private readonly jobsDataAccessService = inject(JobsDataAccessService);

  readonly jobId = input.required<number>();
  readonly edit = output<ContactDto>();
  readonly remove = output<ContactDto>();

  constructor() {
    effect(() => {
      this.jobsDataAccessService.selectJob(this.jobId());
    });
  }

  protected readonly contactsResource =
    this.jobsDataAccessService.jobContactsResource;

  protected onEdit(contact: ContactDto): void {
    this.edit.emit(contact);
  }

  protected onRemove(contact: ContactDto): void {
    this.remove.emit(contact);
  }
}
