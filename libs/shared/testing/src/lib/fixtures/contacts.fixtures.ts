import {
  ContactDto,
  CreateContactDto,
  UpdateContactDto,
} from '@job-tracker-lite-angular/schemas';

export interface ContactFixturesMap {
  janeDoe: ContactDto;
  johnDoe: ContactDto;
  updatedContact: ContactDto;
}

export const contactFixtures: ContactFixturesMap = {
  janeDoe: {
    id: 'ck1234567901',
    jobId: 'ck1234567899',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phoneNumber: '12345',
    createdAt: '2026-04-29T09:00:00.000Z',
    updatedAt: '2026-04-29T09:00:00.000Z',
  },
  johnDoe: {
    id: 'ck1234567902',
    jobId: 'ck1234567899',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '555-111',
    createdAt: '2026-04-29T09:00:00.000Z',
    updatedAt: '2026-04-29T09:00:00.000Z',
  },
  updatedContact: {
    id: 'ck1234567902',
    jobId: 'ck1234567899',
    name: 'Updated',
    email: 'updated@example.com',
    phoneNumber: '999',
    createdAt: '2026-04-29T09:00:00.000Z',
    updatedAt: '2026-04-29T09:00:00.000Z',
  },
};

export interface CreateContactFixturesMap {
  janeDoe: CreateContactDto;
  johnDoe: CreateContactDto;
}

export const createContactFixtures: CreateContactFixturesMap = {
  janeDoe: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phoneNumber: '+3612345678',
  },
  johnDoe: {
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+3612345679',
  },
};

export interface UpdateContactFixturesMap {
  updatedContact: UpdateContactDto;
}

export const updateContactFixtures: UpdateContactFixturesMap = {
  updatedContact: {
    name: 'Updated',
    email: 'updated@example.com',
    phoneNumber: '999',
  },
};
