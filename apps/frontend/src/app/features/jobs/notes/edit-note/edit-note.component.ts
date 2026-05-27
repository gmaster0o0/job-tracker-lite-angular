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
import { NoteDto, updateNoteSchema } from '@job-tracker-lite-angular/schemas';
import {
  NotesDataAccessService,
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

type EditNoteDialogContext = {
  jobId: string;
  note: Pick<NoteDto, 'id' | 'title' | 'body'>;
  onUpdated?: () => void;
};

@Component({
  standalone: true,
  selector: 'app-edit-note',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInputImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmDialogImports,
    HlmTextarea,
    EditJobDialogFooterComponent,
    TranslocoModule,
    FormRoot,
    FormField,
    ZodNgControlBridgeDirective,
    ServerErrorAlertComponent,
  ],
  templateUrl: './edit-note.component.html',
})
export class EditNoteComponent {
  private readonly dataAccess = inject(NotesDataAccessService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly dialogContext =
    injectBrnDialogContext<EditNoteDialogContext>({ optional: true }) ?? {
      jobId: '',
      note: { id: '', title: '', body: '' },
    };

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly noteModel = signal({
    title: this.dialogContext.note.title ?? '',
    body: this.dialogContext.note.body ?? '',
  });

  protected readonly noteForm = form(
    this.noteModel,
    (path) => validateStandardSchema(path, updateNoteSchema),
    {
      submission: {
        action: async (data) => {
          this.isSubmitting.set(true);
          this.submitError.set(null);
          try {
            const note = await this.dataAccess.updateNote(
              this.dialogContext.jobId,
              this.dialogContext.note.id,
              data().value(),
            );
            this.dialogContext.onUpdated?.();
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
