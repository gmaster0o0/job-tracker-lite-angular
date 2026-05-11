import {
  ContactDto,
  CreateContactDto,
  UpdateContactDto,
} from '@job-tracker-lite-angular/api-interfaces';
import {
  contactFixtures,
  createContactFixtures,
} from '../fixtures/contacts.fixtures';
import { ResourceState } from './ResourceState';

export type ContactsDataAccessMockOptions = {
  contacts?: ContactDto[];
  createContact?: (
    jobId: string,
    createContactDto: CreateContactDto,
  ) => Promise<ContactDto>;
  updateContact?: (
    jobId: string,
    contactId: string,
    updateContactDto: UpdateContactDto,
  ) => Promise<ContactDto>;
  deleteContact?: (jobId: string, contactId: string) => Promise<void>;
};

export function createContactsDataAccessMock(
  options: ContactsDataAccessMockOptions = {},
) {
  const contacts = options.contacts ?? [];

  const contactsResource: ResourceState<ContactDto[]> = {
    value: () => contacts,
    isLoading: () => false,
    reload: () => undefined,
    error: () => null,
  };

  return {
    getContactsResource: () => contactsResource,
    contactsResource,
    selectJob: () => {
      /*empty*/
    },
    createContact:
      options.createContact ?? (async () => contactFixtures.janeDoe),
    updateContact:
      options.updateContact ?? (async () => contactFixtures.updatedContact),
    deleteContact: options.deleteContact ?? (async () => undefined),
    __fixtures: {
      createContact: createContactFixtures,
      contacts,
    },
  };
}
