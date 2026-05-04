import { Injectable, inject } from '@angular/core';
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

  getNotesResource(jobId: number) {
    return httpResource<NoteDto[]>(() => `/api/jobs/${jobId}/notes`);
  }

  async createNote(
    jobId: number,
    createNoteDto: CreateNoteDto,
  ): Promise<NoteDto> {
    const note = await firstValueFrom(
      this.http.post<NoteDto>(`/api/jobs/${jobId}/notes`, createNoteDto),
    );

    return note;
  }

  async updateNote(
    jobId: number,
    noteId: number,
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

  async deleteNote(jobId: number, noteId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`/api/jobs/${jobId}/notes/${noteId}`),
    );
  }
}
