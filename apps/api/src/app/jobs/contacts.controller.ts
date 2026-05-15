import { Controller, Get, Post, Patch, Delete } from '@nestjs/common';

import {
  ContactDto,
  contactIdParamSchema,
  CreateContactDto,
  createContactSchema,
  jobIdParamSchema,
  UpdateContactDto,
  updateContactSchema,
} from '@job-tracker-lite-angular/schemas';
import { JobsService } from './jobs.service';
import { ZodBody, ZodParam } from '@job-tracker-lite-angular/core-utils';

@Controller('jobs/:id/contacts')
export class ContactsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findContacts(
    @ZodParam('id', jobIdParamSchema) id: string,
  ): Promise<ContactDto[]> {
    return this.jobsService.findContacts(id);
  }

  @Post()
  async createContact(
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodBody(createContactSchema) createContactDto: CreateContactDto,
  ): Promise<ContactDto> {
    return this.jobsService.createContact(id, createContactDto);
  }

  @Patch(':contactId')
  async updateContact(
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodParam('contactId', contactIdParamSchema) contactId: string,
    @ZodBody(updateContactSchema) updateContactDto: UpdateContactDto,
  ): Promise<ContactDto> {
    return this.jobsService.updateContact(id, contactId, updateContactDto);
  }

  @Delete(':contactId')
  async deleteContact(
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodParam('contactId', contactIdParamSchema) contactId: string,
  ): Promise<void> {
    await this.jobsService.deleteContact(id, contactId);
  }
}
