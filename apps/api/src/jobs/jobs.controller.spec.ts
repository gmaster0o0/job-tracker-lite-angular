import { Test } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
  let controller: JobsController;
  let jobsService: {
    findAll: jest.Mock;
    create: jest.Mock;
    updateStatus: jest.Mock;
    findContacts: jest.Mock;
    createContact: jest.Mock;
    updateContact: jest.Mock;
    deleteContact: jest.Mock;
  };

  beforeEach(async () => {
    jobsService = {
      findAll: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      findContacts: jest.fn(),
      createContact: jest.fn(),
      updateContact: jest.fn(),
      deleteContact: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: jobsService,
        },
      ],
    }).compile();

    controller = moduleRef.get(JobsController);
  });

  it('should return jobs from the service', async () => {
    jobsService.findAll.mockResolvedValue([{ id: 1, position: 'Angular Dev' }]);

    await expect(controller.findAll()).resolves.toEqual([
      { id: 1, position: 'Angular Dev' },
    ]);
  });

  it('should delegate creation to the service', async () => {
    jobsService.create.mockResolvedValue({ id: 3, status: 'saved' });

    await expect(
      controller.create({
        position: 'Designer',
        link: 'https://example.com/jobs/designer',
        description: 'Shape product UI',
        company: 'Initech',
      }),
    ).resolves.toEqual({ id: 3, status: 'saved' });
  });

  it('should delegate status changes to the service', async () => {
    jobsService.updateStatus.mockResolvedValue({ id: 3, status: 'applied' });

    await expect(
      controller.updateStatus(3, { status: 'applied' }),
    ).resolves.toEqual({ id: 3, status: 'applied' });
  });

  it('should delegate contact listing to the service', async () => {
    jobsService.findContacts.mockResolvedValue([{ id: 1, name: 'Jane Doe' }]);

    await expect(controller.findContacts(10)).resolves.toEqual([
      { id: 1, name: 'Jane Doe' },
    ]);
  });

  it('should delegate contact creation to the service', async () => {
    jobsService.createContact.mockResolvedValue({ id: 2, name: 'John Doe' });

    await expect(
      controller.createContact(10, {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '555-111',
      }),
    ).resolves.toEqual({ id: 2, name: 'John Doe' });
  });

  it('should delegate contact update to the service', async () => {
    jobsService.updateContact.mockResolvedValue({ id: 2, name: 'Updated' });

    await expect(
      controller.updateContact(10, 2, { name: 'Updated' }),
    ).resolves.toEqual({ id: 2, name: 'Updated' });
  });

  it('should delegate contact deletion to the service', async () => {
    jobsService.deleteContact.mockResolvedValue(undefined);

    await expect(controller.deleteContact(10, 2)).resolves.toBeUndefined();
  });
});
