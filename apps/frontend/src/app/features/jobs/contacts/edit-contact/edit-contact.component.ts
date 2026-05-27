import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import {
  updateContactSchema,
  ContactDto,
} from '@job-tracker-lite-angular/schemas';
import {
  ContactsDataAccessService,
  ZodNgControlBridgeDirective,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  EditJobDialogFooterComponent,
  ServerErrorAlertComponent,
} from '@job-tracker-lite-angular/frontend-shared';
import { TranslocoModule } from '@jsverse/transloco';
import {
  form,
  validateStandardSchema,
  FormRoot,
  FormField,
} from '@angular/forms/signals';

type EditContactDialogContext = {
  jobId: string;
  contact: Pick<ContactDto, 'id' | 'name' | 'email' | 'phoneNumber'>;
  onUpdated?: () => void;
};

@Component({
  standalone: true,
  selector: 'app-edit-contact',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInputImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmDialogImports,
    EditJobDialogFooterComponent,
    TranslocoModule,
    FormRoot,
    FormField,
    ZodNgControlBridgeDirective,
    ServerErrorAlertComponent,
  ],
  templateUrl: './edit-contact.component.html',
})
export class EditContactComponent {
  private readonly dataAccess = inject(ContactsDataAccessService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly dialogContext =
    injectBrnDialogContext<EditContactDialogContext>({ optional: true }) ?? {
      jobId: '',
      contact: { id: '', name: '', email: '', phoneNumber: '' },
    };

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly contactModel = signal({
    name: this.dialogContext.contact.name ?? '',
    email: this.dialogContext.contact.email ?? '',
    phoneNumber: this.dialogContext.contact.phoneNumber ?? '',
  });

  protected readonly contactForm = form(
    this.contactModel,
    (path) => validateStandardSchema(path, updateContactSchema),
    {
      submission: {
        action: async (data) => {
          this.isSubmitting.set(true);
          this.submitError.set(null);
          try {
            const contact = await this.dataAccess.updateContact(
              this.dialogContext.jobId,
              this.dialogContext.contact.id,
              data().value(),
            );
            this.dialogContext.onUpdated?.();
            this.dialogRef?.close(contact);
          } catch (error) {
            this.submitError.set(
              isBackendError(error) ? error.errorCode : 'unknown',
            );
          } finally {
            this.isSubmitting.set(false);
          }
        },
      },
    },
  );
}
