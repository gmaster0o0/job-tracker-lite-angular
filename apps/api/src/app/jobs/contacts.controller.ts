import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

import {
  ContactDto,
  CreateContactDto,
  jobIdParamSchema,
  UpdateContactDto,
} from '@job-tracker-lite-angular/schemas';
import { JobsService } from './jobs.service';
import { ZodValidationPipe } from '@job-tracker-lite-angular/core-utils';

@Controller('jobs/:id/contacts')
export class ContactsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findContacts(
    @Param('id', new ZodValidationPipe(jobIdParamSchema)) id: string,
  ): Promise<ContactDto[]> {
    return this.jobsService.findContacts(id);
  }

  @Post()
  async createContact(
    @Param('id', new ZodValidationPipe(jobIdParamSchema)) id: string,
    @Body() createContactDto: CreateContactDto,
  ): Promise<ContactDto> {
    return this.jobsService.createContact(id, createContactDto);
  }

  @Patch(':contactId')
  async updateContact(
    @Param('id', new ZodValidationPipe(jobIdParamSchema)) id: string,
    @Param('contactId', new ZodValidationPipe(jobIdParamSchema))
    contactId: string,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<ContactDto> {
    return this.jobsService.updateContact(id, contactId, updateContactDto);
  }

  @Delete(':contactId')
  async deleteContact(
    @Param('id', new ZodValidationPipe(jobIdParamSchema)) id: string,
    @Param('contactId', new ZodValidationPipe(jobIdParamSchema))
    contactId: string,
  ): Promise<void> {
    await this.jobsService.deleteContact(id, contactId);
  }
}
