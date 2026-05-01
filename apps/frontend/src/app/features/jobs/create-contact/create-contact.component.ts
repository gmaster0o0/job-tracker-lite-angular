import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';
import { ContactsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';

type CreateContactDialogContext = {
  jobId: number;
  onCreated?: (contact: ContactDto) => void;
};

@Component({
  standalone: true,
  selector: 'app-create-contact',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButtonImports,
    HlmInputImports,
  ],
  templateUrl: './create-contact.component.html',
})
export class CreateContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dataAccess = inject(ContactsDataAccessService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly context = injectBrnDialogContext<CreateContactDialogContext>(
    { optional: true },
  ) ?? { jobId: 0 };

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    this.isSubmitting.set(true);

    try {
      const created = await this.dataAccess.createContact(this.context.jobId, {
        name: this.form.controls.name.value.trim(),
        email: this.form.controls.email.value.trim(),
        phoneNumber: this.form.controls.phoneNumber.value.trim(),
      });

      this.context.onCreated?.(created);
      this.dialogRef?.close(created);
    } catch {
      this.submitError.set('Failed to create contact. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected cancel(): void {
    this.dialogRef?.close();
  }
}
