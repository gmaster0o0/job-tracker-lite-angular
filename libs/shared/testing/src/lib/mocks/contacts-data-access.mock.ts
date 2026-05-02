import {
  ContactDto,
  CreateContactDto,
  UpdateContactDto,
} from '@job-tracker-lite-angular/api-interfaces';
import {
  contactFixtures,
  createContactFixtures,
} from '../fixtures/contacts.fixtures';

type ResourceState<T> = {
  value: () => T;
  isLoading: () => boolean;
  reload: () => void;
  error: () => unknown;
};

export type ContactsDataAccessMockOptions = {
  contacts?: ContactDto[];
  createContact?: (
    jobId: number,
    createContactDto: CreateContactDto,
  ) => Promise<ContactDto>;
  updateContact?: (
    jobId: number,
    contactId: number,
    updateContactDto: UpdateContactDto,
  ) => Promise<ContactDto>;
  deleteContact?: (jobId: number, contactId: number) => Promise<void>;
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
