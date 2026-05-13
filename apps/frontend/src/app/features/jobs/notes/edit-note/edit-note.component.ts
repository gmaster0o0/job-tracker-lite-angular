import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NoteDto } from '@job-tracker-lite-angular/api-interfaces';
import { NotesDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { EditJobDialogFooterComponent } from '@job-tracker-lite-angular/frontend-shared';
import { TranslocoModule } from '@jsverse/transloco';

type EditNoteDialogContext = {
  jobId: string;
  note: NoteDto;
  onUpdated?: () => void;
};

@Component({
  standalone: true,
  selector: 'app-edit-note',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButtonImports,
    HlmInputImports,
    EditJobDialogFooterComponent,
    TranslocoModule,
  ],
  templateUrl: './edit-note.component.html',
})
export class EditNoteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notesDataAccess = inject(NotesDataAccessService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly context = injectBrnDialogContext<EditNoteDialogContext>({
    optional: true,
  }) ?? {
    jobId: 0,
    note: {
      id: 0,
      jobId: 0,
      title: '',
      body: '',
      createdAt: '',
      updatedAt: '',
    },
  };

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: [this.context.note.title, Validators.required],
    body: [this.context.note.body, Validators.required],
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    this.isSubmitting.set(true);

    try {
      const updated = await this.notesDataAccess.updateNote(
        this.context.jobId,
        this.context.note.id,
        {
          title: this.form.controls.title.value.trim(),
          body: this.form.controls.body.value.trim(),
        },
      );

      this.context.onUpdated?.();
      this.dialogRef?.close(updated);
    } catch {
      this.submitError.set('Failed to update note. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected cancel(): void {
    this.dialogRef?.close();
  }
}
