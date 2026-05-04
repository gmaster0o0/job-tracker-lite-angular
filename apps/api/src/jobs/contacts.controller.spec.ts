import { Test } from '@nestjs/testing';
import { ContactsController } from './contacts.contoller';
import { JobsService } from './jobs.service';
import {
  contactFixtures,
  createContactFixtures,
  updateContactFixtures,
} from '@job-tracker-lite-angular/shared-testing';

describe('ContactsController', () => {
  let contactsController: ContactsController;

  let jobsService: {
    findContacts: jest.Mock;
    createContact: jest.Mock;
    updateContact: jest.Mock;
    deleteContact: jest.Mock;
  };

  beforeEach(async () => {
    jobsService = {
      findContacts: jest.fn(),
      createContact: jest.fn(),
      updateContact: jest.fn(),
      deleteContact: jest.fn(),
    };

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

    await expect(contactsController.findContacts(10)).resolves.toEqual([
      contactFixtures.janeDoe,
    ]);
  });

  it('should delegate contact creation to the service', async () => {
    jobsService.createContact.mockResolvedValue(contactFixtures.johnDoe);

    await expect(
      contactsController.createContact(10, createContactFixtures.johnDoe),
    ).resolves.toEqual(contactFixtures.johnDoe);
  });

  it('should delegate contact update to the service', async () => {
    jobsService.updateContact.mockResolvedValue(contactFixtures.updatedContact);

    await expect(
      contactsController.updateContact(
        10,
        2,
        updateContactFixtures.updatedContact,
      ),
    ).resolves.toEqual(contactFixtures.updatedContact);
  });

  it('should delegate contact deletion to the service', async () => {
    jobsService.deleteContact.mockResolvedValue(undefined);

    await expect(
      contactsController.deleteContact(10, 2),
    ).resolves.toBeUndefined();
  });
});
