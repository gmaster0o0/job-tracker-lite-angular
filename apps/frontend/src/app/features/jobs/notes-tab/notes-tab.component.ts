import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { NoteDto } from '@job-tracker-lite-angular/api-interfaces';
import {
  JobsDataAccessService,
  NotesDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { NotesListComponent } from '../notes-list/notes-list.component';
import { EditNoteComponent } from '../edit-note/edit-note.component';
import { DeleteConfirmationDialogComponent } from '../../../shared/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CreateNoteComponent } from '../create-note/create-note.component';

@Component({
  standalone: true,
  selector: 'app-notes-tab',
  imports: [CommonModule, HlmButtonImports, HlmIconImports, NotesListComponent],
  providers: [provideIcons({ lucidePlus })],
  templateUrl: './notes-tab.component.html',
})
export class NotesTabComponent {
  private readonly jobsDataAccess = inject(JobsDataAccessService);
  private readonly notesDataAccess = inject(NotesDataAccessService);
  private readonly dialog = inject(HlmDialogService);

  readonly jobId = input.required<number>();

  protected readonly notesResource = this.notesDataAccess.notesResource;

  protected openCreateDialog(): void {
    this.dialog.open(CreateNoteComponent, {
      contentClass: 'sm:max-w-2xl w-[80vw]',
      context: {
        jobId: this.jobId(),
        onCreated: async () => {
          this.notesDataAccess.notesResource.reload();
        },
      },
    });
  }

  protected openEditDialog(note: NoteDto): void {
    this.dialog.open(EditNoteComponent, {
      contentClass: 'sm:max-w-2xl w-[80vw]',
      context: {
        jobId: this.jobId(),
        note,
        onUpdated: async () => {
          this.notesDataAccess.notesResource.reload();
        },
      },
    });
  }

  protected openDeleteDialog(note: NoteDto): void {
    this.dialog.open(DeleteConfirmationDialogComponent, {
      contentClass: 'sm:max-w-md !sm:mx-auto',
      context: {
        description:
          'Are you absolutely sure? This action cannot be undone. This will permanently delete the resource.',
        onConfirm: async () => {
          await this.notesDataAccess.deleteNote(this.jobId(), note.id);
          this.notesDataAccess.notesResource.reload();
        },
      },
    });
  }
}
