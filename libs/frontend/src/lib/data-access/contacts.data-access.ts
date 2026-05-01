import { Injectable, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  ContactDto,
  CreateContactDto,
  UpdateContactDto,
} from '@job-tracker-lite-angular/api-interfaces';

@Injectable({
  providedIn: 'root',
})
export class ContactsDataAccessService {
  private readonly http = inject(HttpClient);

  getContacts(jobId: number) {
    return httpResource<ContactDto[]>(() => `/api/jobs/${jobId}/contacts`);
  }

  async createContact(
    jobId: number,
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
    jobId: number,
    contactId: number,
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

  async deleteContact(jobId: number, contactId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`/api/jobs/${jobId}/contacts/${contactId}`),
    );
  }
}
