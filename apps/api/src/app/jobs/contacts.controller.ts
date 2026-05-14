import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';
import { JobsService } from './jobs.service';
import {
  CreateContactDtoRequest,
  UpdateContactDtoRequest,
} from './dto/contacts.dto';
import { ParseCuidPipe } from '@job-tracker-lite-angular/core-utils';

@Controller('jobs/:id/contacts')
export class ContactsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findContacts(@Param('id') id: string): Promise<ContactDto[]> {
    return this.jobsService.findContacts(id);
  }

  @Post()
  async createContact(
    @Param('id', ParseCuidPipe) id: string,
    @Body() createContactDto: CreateContactDtoRequest,
  ): Promise<ContactDto> {
    return this.jobsService.createContact(id, createContactDto);
  }

  @Patch(':contactId')
  async updateContact(
    @Param('id', ParseCuidPipe) id: string,
    @Param('contactId', ParseCuidPipe) contactId: string,
    @Body() updateContactDto: UpdateContactDtoRequest,
  ): Promise<ContactDto> {
    return this.jobsService.updateContact(id, contactId, updateContactDto);
  }

  @Delete(':contactId')
  async deleteContact(
    @Param('id', ParseCuidPipe) id: string,
    @Param('contactId', ParseCuidPipe) contactId: string,
  ): Promise<void> {
    await this.jobsService.deleteContact(id, contactId);
  }
}
