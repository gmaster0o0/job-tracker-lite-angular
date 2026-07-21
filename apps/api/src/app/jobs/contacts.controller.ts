import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import {
  contactSchema,
  ContactDto,
  contactIdParamSchema,
  CreateContactDto,
  createContactSchema,
  jobIdParamSchema,
  UpdateContactDto,
  updateContactSchema,
} from '@job-tracker-lite-angular/schemas';
import { JobsService } from './jobs.service';
import {
  ZodBody,
  ZodParam,
  zodToApiSchema,
} from '@job-tracker-lite-angular/core-utils';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('jobs/:id/contacts')
@UseGuards(AuthGuard)
export class ContactsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({
    summary: 'List contacts for a job application',
    description:
      'Returns every contact associated with the given job application.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job application identifier (CUID2)',
    schema: zodToApiSchema(jobIdParamSchema),
  })
  @ApiOkResponse({
    schema: { type: 'array', items: zodToApiSchema(contactSchema) },
  })
  async findContacts(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
  ): Promise<ContactDto[]> {
    return this.jobsService.findContacts(session.user.id, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Add a contact to a job application',
    description:
      'Creates a new contact linked to the given job application. Either an email or a phone number must be provided.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job application identifier (CUID2)',
    schema: zodToApiSchema(jobIdParamSchema),
  })
  @ApiBody({
    description: 'Contact to create',
    schema: zodToApiSchema(createContactSchema),
  })
  @ApiOkResponse({ schema: zodToApiSchema(contactSchema) })
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
  @ApiOperation({
    summary: 'Update a contact',
    description: 'Partially updates the fields of an existing contact.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job application identifier (CUID2)',
    schema: zodToApiSchema(jobIdParamSchema),
  })
  @ApiParam({
    name: 'contactId',
    description: 'Contact identifier (CUID2)',
    schema: zodToApiSchema(contactIdParamSchema),
  })
  @ApiBody({
    description: 'Fields to update on the contact',
    schema: zodToApiSchema(updateContactSchema),
  })
  @ApiOkResponse({ schema: zodToApiSchema(contactSchema) })
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
  @ApiOperation({
    summary: 'Delete a contact',
    description: 'Permanently deletes a contact from a job application.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job application identifier (CUID2)',
    schema: zodToApiSchema(jobIdParamSchema),
  })
  @ApiParam({
    name: 'contactId',
    description: 'Contact identifier (CUID2)',
    schema: zodToApiSchema(contactIdParamSchema),
  })
  async deleteContact(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodParam('contactId', contactIdParamSchema) contactId: string,
  ): Promise<void> {
    await this.jobsService.deleteContact(session.user.id, id, contactId);
  }
}
