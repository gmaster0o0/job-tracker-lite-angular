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
import { CreateContactComponent } from '../create-contact/create-contact.component';
import { DeleteContactAlertDialogComponent } from '../delete-contact-alert-dialog/delete-contact-alert-dialog.component';
import { EditContactComponent } from '../edit-contact/edit-contact.component';
import { NotesListComponent } from '../notes-list/notes-list.component';

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

  protected readonly notesResource = this.notesDataAccess.getNotesResource(
    this.jobId,
  );

  protected openCreateDialog(): void {
    this.dialog.open(CreateContactComponent, {
      contentClass: 'sm:max-w-lg !sm:mx-auto',
      context: {
        jobId: this.jobId(),
        onCreated: async () => {
          this.notesResource.reload();
        },
      },
    });
  }

  protected openEditDialog(note: NoteDto): void {
    this.dialog.open(EditContactComponent, {
      contentClass: 'sm:max-w-lg !sm:mx-auto',
      context: {
        jobId: this.jobId(),
        note,
        onUpdated: async () => {
          this.notesResource.reload();
        },
      },
    });
  }

  protected openDeleteDialog(note: NoteDto): void {
    this.dialog.open(DeleteContactAlertDialogComponent, {
      contentClass: 'sm:max-w-md !sm:mx-auto',
      context: {
        onConfirm: async () => {
          await this.notesDataAccess.deleteNote(this.jobId(), note.id);
          this.notesResource.reload();
        },
      },
    });
  }
}
