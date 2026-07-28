import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { NoteDto } from '@job-tracker-lite-angular/schemas';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { AppDatePipe } from '@job-tracker-lite-angular/frontend-data-access';

@Component({
  standalone: true,
  selector: 'app-notes-list-item',
  imports: [
    CommonModule,
    HlmButtonImports,
    HlmCardImports,
    HlmIconImports,
    HlmTooltipImports,
    AppDatePipe,
  ],
  providers: provideIcons({ lucidePencil, lucideTrash2 }),
  templateUrl: './notes-list-item.component.html',
})
export class NotesListItemComponent {
  readonly note = input.required<NoteDto>();
  readonly edit = output<NoteDto>();
  readonly remove = output<NoteDto>();

  protected onEdit(): void {
    this.edit.emit(this.note());
  }

  protected onRemove(): void {
    this.remove.emit(this.note());
  }
}
