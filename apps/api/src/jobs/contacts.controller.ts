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
  UpdateContactDto,
  CreateContactDto,
} from '@job-tracker-lite-angular/api-interfaces';
import { JobsService } from './jobs.service';

@Controller('jobs/:id/contacts')
export class ContactsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findContacts(@Param('id') id: string): Promise<ContactDto[]> {
    return this.jobsService.findContacts(id);
  }

  @Post()
  async createContact(
    @Param('id') id: string,
    @Body() createContactDto: CreateContactDto,
  ): Promise<ContactDto> {
    return this.jobsService.createContact(id, createContactDto);
  }

  @Patch(':contactId')
  async updateContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<ContactDto> {
    return this.jobsService.updateContact(id, contactId, updateContactDto);
  }

  @Delete(':contactId')
  async deleteContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string,
  ): Promise<void> {
    await this.jobsService.deleteContact(id, contactId);
  }
}
