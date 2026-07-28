import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { createNoteSchema, NoteDto } from '@job-tracker-lite-angular/schemas';
import {
  NotesDataAccessService,
  ZodNgControlBridgeDirective,
  isBackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  CreateJobDialogFooterComponent,
  ServerErrorAlertComponent,
} from '@job-tracker-lite-angular/frontend-shared';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';
import {
  form,
  validateStandardSchema,
  FormRoot,
  FormField,
} from '@angular/forms/signals';
import { NotificationService } from '@job-tracker-lite-angular/frontend-data-access';

type CreateNoteDialogContext = {
  jobId: string;
  onCreated?: (note: NoteDto) => void;
};

@Component({
  standalone: true,
  selector: 'app-create-note',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInputImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmDialogImports,
    HlmTextarea,
    CreateJobDialogFooterComponent,
    TranslocoModule,
    FormRoot,
    FormField,
    ZodNgControlBridgeDirective,
    ServerErrorAlertComponent,
  ],
  templateUrl: './create-note.component.html',
})
export class CreateNoteComponent {
  private readonly dataAccess = inject(NotesDataAccessService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly context = injectBrnDialogContext<CreateNoteDialogContext>({
    optional: true,
  }) ?? { jobId: '' };

  private readonly successMessage = translateSignal(
    'jobs.notes.create.success',
    { defaultValue: 'Note created successfully' },
  );

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly noteModel = signal({
    title: '',
    body: '',
  });

  protected readonly noteForm = form(
    this.noteModel,
    (path) => validateStandardSchema(path, createNoteSchema),
    {
      submission: {
        action: async (data) => {
          this.isSubmitting.set(true);
          this.submitError.set(null);
          try {
            const note = await this.dataAccess.createNote(
              this.context.jobId,
              data().value(),
            );

            this.notification.success(this.successMessage());
            this.context.onCreated?.(note);
            this.dialogRef?.close(note);
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
