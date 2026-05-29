import { Test } from '@nestjs/testing';
// TODO : Extract the jest.mock to a separate file to avoid repetition across controller tests
// MOCKS SHOULD BE IN THE TESTING LIBRARY, NOT IN THE TEST FILES THEMSELVES

jest.mock('@thallesp/nestjs-better-auth', () => ({
  AuthGuard: class AuthGuard {},
  Session: () => () => undefined,
}));

import { ContactsController } from './contacts.controller';
import { JobsService } from './jobs.service';
import {
  authSessionFixtures,
  contactFixtures,
  createContactFixtures,
  updateContactFixtures,
  createJobsServiceMock,
} from '@job-tracker-lite-angular/testing';

describe('ContactsController', () => {
  let contactsController: ContactsController;
  let jobsService: any;

  beforeEach(async () => {
    jobsService = createJobsServiceMock(jest.fn);

    const moduleRef = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        {
          provide: JobsService,
          useValue: jobsService,
        },
      ],
    }).compile();

    contactsController = moduleRef.get(ContactsController);
  });
  it('should delegate contact listing to the service', async () => {
    jobsService.findContacts.mockResolvedValue([contactFixtures.janeDoe]);

    await expect(
      contactsController.findContacts(
        authSessionFixtures.authenticated as never,
        '10',
      ),
    ).resolves.toEqual([contactFixtures.janeDoe]);
  });

  it('should delegate contact creation to the service', async () => {
    jobsService.createContact.mockResolvedValue(contactFixtures.johnDoe);

    await expect(
      contactsController.createContact(
        authSessionFixtures.authenticated as never,
        '10',
        createContactFixtures.johnDoe,
      ),
    ).resolves.toEqual(contactFixtures.johnDoe);
  });

  it('should delegate contact update to the service', async () => {
    jobsService.updateContact.mockResolvedValue(contactFixtures.updatedContact);

    await expect(
      contactsController.updateContact(
        authSessionFixtures.authenticated as never,
        '10',
        '2',
        updateContactFixtures.updatedContact,
      ),
    ).resolves.toEqual(contactFixtures.updatedContact);
  });

  it('should delegate contact deletion to the service', async () => {
    jobsService.deleteContact.mockResolvedValue(undefined);

    await expect(
      contactsController.deleteContact(
        authSessionFixtures.authenticated as never,
        '10',
        '2',
      ),
    ).resolves.toBeUndefined();
  });
});
