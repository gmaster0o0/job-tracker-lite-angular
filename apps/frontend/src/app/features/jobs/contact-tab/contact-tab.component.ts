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
import { DeleteContactAlertDialogComponent } from '../delete-contact-alert-dialog/delete-contact-alert-dialog.component';
import { EditContactComponent } from '../edit-contact/edit-contact.component';

@Component({
  standalone: true,
  selector: 'app-contact-tab',
  imports: [
    CommonModule,
    HlmButtonImports,
    HlmIconImports,
    ContactListComponent,
  ],
  providers: [provideIcons({ lucidePlus })],
  templateUrl: './contact-tab.component.html',
})
export class ContactTabComponent {
  private readonly jobsDataAccess = inject(JobsDataAccessService);
  private readonly contactsDataAccess = inject(ContactsDataAccessService);
  private readonly dialog = inject(HlmDialogService);

  readonly jobId = input.required<number>();

  protected readonly contactsResource = this.jobsDataAccess.jobContactsResource;

  protected openCreateDialog(): void {
    this.dialog.open(CreateContactComponent, {
      contentClass: 'sm:max-w-lg !sm:mx-auto',
      context: {
        jobId: this.jobId(),
      },
    });
  }

  protected openEditDialog(contact: ContactDto): void {
    this.dialog.open(EditContactComponent, {
      contentClass: 'sm:max-w-lg !sm:mx-auto',
      context: {
        jobId: this.jobId(),
        contact,
      },
    });
  }

  protected openDeleteDialog(contact: ContactDto): void {
    this.dialog.open(DeleteContactAlertDialogComponent, {
      contentClass: 'sm:max-w-md !sm:mx-auto',
      context: {
        contactName: contact.name,
        onConfirm: async () => {
          await this.contactsDataAccess.deleteContact(this.jobId(), contact.id);
        },
      },
    });
  }
}
