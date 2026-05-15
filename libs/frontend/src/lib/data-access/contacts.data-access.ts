import { Injectable, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  ContactDto,
  CreateContactDto,
  UpdateContactDto,
} from '@job-tracker-lite-angular/schemas';

@Injectable({
  providedIn: 'root',
})
export class ContactsDataAccessService {
  private readonly http = inject(HttpClient);
  private readonly selectedJobId = signal<string | null>(null);

  contactsResource = httpResource<ContactDto[]>(() => {
    const id = this.selectedJobId();
    return id === null ? undefined : `/api/jobs/${id}/contacts`;
  });

  selectJob(id: string | null): void {
    this.selectedJobId.set(id);
  }

  async createContact(
    jobId: string,
    createContactDto: CreateContactDto,
  ): Promise<ContactDto> {
    const contact = await firstValueFrom(
      this.http.post<ContactDto>(
        `/api/jobs/${jobId}/contacts`,
        createContactDto,
      ),
    );

    return contact;
  }

  async updateContact(
    jobId: string,
    contactId: string,
    updateContactDto: UpdateContactDto,
  ): Promise<ContactDto> {
    const contact = await firstValueFrom(
      this.http.patch<ContactDto>(
        `/api/jobs/${jobId}/contacts/${contactId}`,
        updateContactDto,
      ),
    );

    return contact;
  }

  async deleteContact(jobId: string, contactId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`/api/jobs/${jobId}/contacts/${contactId}`),
    );
  }
}
