import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';
import { ContactsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';

type EditContactDialogContext = {
  jobId: number;
  contact: ContactDto;
  onUpdated?: (contact: ContactDto) => void;
};

@Component({
  standalone: true,
  selector: 'app-edit-contact',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButtonImports,
    HlmInputImports,
  ],
  templateUrl: './edit-contact.component.html',
})
export class EditContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contactsDataAccess = inject(ContactsDataAccessService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly context = injectBrnDialogContext<EditContactDialogContext>({
    optional: true,
  }) ?? {
    jobId: 0,
    contact: {
      id: 0,
      jobId: 0,
      name: '',
      email: '',
      phoneNumber: '',
      createdAt: '',
      updatedAt: '',
    },
  };

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: [this.context.contact.name, Validators.required],
    email: [
      this.context.contact.email,
      [Validators.required, Validators.email],
    ],
    phoneNumber: [this.context.contact.phoneNumber, Validators.required],
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    this.isSubmitting.set(true);

    try {
      const updated = await this.contactsDataAccess.updateContact(
        this.context.jobId,
        this.context.contact.id,
        {
          name: this.form.controls.name.value.trim(),
          email: this.form.controls.email.value.trim(),
          phoneNumber: this.form.controls.phoneNumber.value.trim(),
        },
      );

      this.context.onUpdated?.(updated);
      this.dialogRef?.close(updated);
    } catch {
      this.submitError.set('Failed to update contact. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected cancel(): void {
    this.dialogRef?.close();
  }
}
