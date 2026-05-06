import { Component, inject, effect, input, output } from '@angular/core';
import { NoteDto } from '@job-tracker-lite-angular/api-interfaces';
import {
  JobsDataAccessService,
  NotesDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';

import { NotesListItemComponent } from '../notes-list-item/notes-list-item.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notes-list',
  imports: [CommonModule, NotesListItemComponent],
  templateUrl: './notes-list.component.html',
})
export class NotesListComponent {
  private readonly jobsDataAccessService = inject(JobsDataAccessService);
  private readonly notesDataAccessService = inject(NotesDataAccessService);
  readonly jobId = input.required<number>();
  readonly edit = output<NoteDto>();
  readonly remove = output<NoteDto>();

  protected readonly notesResource = this.notesDataAccessService.notesResource;

  protected onEdit(note: NoteDto): void {
    this.edit.emit(note);
  }

  protected onRemove(note: NoteDto): void {
    this.remove.emit(note);
  }
}
