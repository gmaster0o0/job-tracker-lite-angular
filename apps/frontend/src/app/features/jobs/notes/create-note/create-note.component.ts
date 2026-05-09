import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NotesDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { HlmFieldGroup, HlmField, HlmFieldError } from '@spartan-ng/helm/field';
import { CreateJobDialogFooterComponent } from '@job-tracker-lite-angular/frontend-shared';

type CreateNoteDialogContext = {
  jobId: number;
  onCreated?: () => void;
};

@Component({
  standalone: true,
  selector: 'app-create-note',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInputImports,
    HlmDialogImports,
    HlmTextareaImports,
    HlmFieldGroup,
    HlmField,
    HlmFieldError,
    CreateJobDialogFooterComponent,
  ],
  templateUrl: './create-note.component.html',
})
export class CreateNoteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dataAccess = inject(NotesDataAccessService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly context = injectBrnDialogContext<CreateNoteDialogContext>({
    optional: true,
  }) ?? { jobId: 0 };

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    body: ['', Validators.required],
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    this.isSubmitting.set(true);

    try {
      const created = await this.dataAccess.createNote(this.context.jobId, {
        title: this.form.controls.title.value.trim(),
        body: this.form.controls.body.value.trim(),
      });

      this.context.onCreated?.();
      this.dialogRef?.close(created);
    } catch {
      this.submitError.set('Failed to create note. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
