import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';
import {
  JobsDataAccessService,
  ContactsDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { ContactListComponent } from '../contact-list/contact-list.component';
import { CreateContactComponent } from '../create-contact/create-contact.component';
import { EditContactComponent } from '../edit-contact/edit-contact.component';
import { DeleteConfirmationDialogComponent } from '../../../../shared/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  standalone: true,
  selector: 'app-contacts-tab',
  imports: [
    CommonModule,
    HlmButtonImports,
    HlmIconImports,
    ContactListComponent,
  ],
  providers: [provideIcons({ lucidePlus })],
  templateUrl: './contacts-tab.component.html',
})
export class ContactsTabComponent {
  private readonly jobsDataAccess = inject(JobsDataAccessService);
  private readonly contactsDataAccess = inject(ContactsDataAccessService);
  private readonly dialog = inject(HlmDialogService);

  readonly jobId = input.required<number>();

  protected readonly contactsResource =
    this.contactsDataAccess.contactsResource;

  protected openCreateDialog(): void {
    this.dialog.open(CreateContactComponent, {
      contentClass: 'sm:max-w-lg !sm:mx-auto',
      context: {
        jobId: this.jobId(),
        onCreated: async () => {
          this.contactsDataAccess.contactsResource.reload();
        },
      },
    });
  }

  protected openEditDialog(contact: ContactDto): void {
    this.dialog.open(EditContactComponent, {
      contentClass: 'sm:max-w-lg !sm:mx-auto',
      context: {
        jobId: this.jobId(),
        contact,
        onUpdated: async () => {
          this.contactsDataAccess.contactsResource.reload();
        },
      },
    });
  }

  protected openDeleteDialog(contact: ContactDto): void {
    this.dialog.open(DeleteConfirmationDialogComponent, {
      contentClass: 'sm:max-w-md !sm:mx-auto',
      context: {
        title: `Delete ${contact.name}?`,
        description:
          'Are you absolutely sure? This action cannot be undone. This will permanently delete the resource.',
        confirmLabel: 'Delete Contact',
        onConfirm: async () => {
          await this.contactsDataAccess.deleteContact(this.jobId(), contact.id);
          this.contactsDataAccess.contactsResource.reload();
        },
      },
    });
  }
}
