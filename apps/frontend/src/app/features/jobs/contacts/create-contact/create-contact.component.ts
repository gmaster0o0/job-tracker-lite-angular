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
  createContactSchema,
  ContactDto,
} from '@job-tracker-lite-angular/schemas';
import {
  ContactsDataAccessService,
  ZodNgControlBridgeDirective,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  CreateJobDialogFooterComponent,
  ServerErrorAlertComponent,
} from '@job-tracker-lite-angular/frontend-shared';
import { TranslocoModule } from '@jsverse/transloco';
import {
  form,
  validateStandardSchema,
  FormRoot,
  FormField,
} from '@angular/forms/signals';

type CreateContactDialogContext = {
  jobId: string;
  onCreated?: (contact: ContactDto) => void;
};

@Component({
  standalone: true,
  selector: 'app-create-contact',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInputImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmDialogImports,
    CreateJobDialogFooterComponent,
    TranslocoModule,
    FormRoot,
    FormField,
    ZodNgControlBridgeDirective,
    ServerErrorAlertComponent,
  ],
  templateUrl: './create-contact.component.html',
})
export class CreateContactComponent {
  private readonly dataAccess = inject(ContactsDataAccessService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly dialogContext =
    injectBrnDialogContext<CreateContactDialogContext>({
      optional: true,
    }) ?? { jobId: '' };

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly contactModel = signal({
    name: '',
    email: '',
    phoneNumber: '',
  });

  protected readonly contactForm = form(
    this.contactModel,
    (path) => validateStandardSchema(path, createContactSchema),
    {
      submission: {
        action: async (data) => {
          this.isSubmitting.set(true);
          this.submitError.set(null);
          try {
            const contact = await this.dataAccess.createContact(
              this.dialogContext.jobId,
              data().value(),
            );
            this.dialogContext.onCreated?.(contact);
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
