import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

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
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller('jobs/:id/contacts')
@UseGuards(AuthGuard)
export class ContactsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findContacts(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
  ): Promise<ContactDto[]> {
    return this.jobsService.findContacts(session.user.id, id);
  }

  @Post()
  async createContact(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodBody(createContactSchema) createContactDto: CreateContactDto,
  ): Promise<ContactDto> {
    return this.jobsService.createContact(
      session.user.id,
      id,
      createContactDto,
    );
  }

  @Patch(':contactId')
  async updateContact(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodParam('contactId', contactIdParamSchema) contactId: string,
    @ZodBody(updateContactSchema) updateContactDto: UpdateContactDto,
  ): Promise<ContactDto> {
    return this.jobsService.updateContact(
      session.user.id,
      id,
      contactId,
      updateContactDto,
    );
  }

  @Delete(':contactId')
  async deleteContact(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodParam('contactId', contactIdParamSchema) contactId: string,
  ): Promise<void> {
    await this.jobsService.deleteContact(session.user.id, id, contactId);
  }
}
