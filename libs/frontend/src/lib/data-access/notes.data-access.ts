import { Injectable, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  NoteDto,
  CreateNoteDto,
  UpdateNoteDto,
} from '@job-tracker-lite-angular/api-interfaces';

@Injectable({
  providedIn: 'root',
})
export class NotesDataAccessService {
  private readonly http = inject(HttpClient);
  private readonly selectedJobId = signal<string | null>(null);

  notesResource = httpResource<NoteDto[]>(() => {
    const id = this.selectedJobId();
    return id === null ? undefined : `/api/jobs/${id}/notes`;
  });

  selectJob(id: string | null): void {
    this.selectedJobId.set(id);
  }

  async createNote(
    jobId: string,
    createNoteDto: CreateNoteDto,
  ): Promise<NoteDto> {
    const note = await firstValueFrom(
      this.http.post<NoteDto>(`/api/jobs/${jobId}/notes`, createNoteDto),
    );

    return note;
  }

  async updateNote(
    jobId: string,
    noteId: string,
    updateNoteDto: UpdateNoteDto,
  ): Promise<NoteDto> {
    const note = await firstValueFrom(
      this.http.patch<NoteDto>(
        `/api/jobs/${jobId}/notes/${noteId}`,
        updateNoteDto,
      ),
    );

    return note;
  }

  async deleteNote(jobId: string, noteId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`/api/jobs/${jobId}/notes/${noteId}`),
    );
  }
}
