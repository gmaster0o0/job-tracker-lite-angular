import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
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
  async findContacts(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContactDto[]> {
    try {
      return await this.jobsService.findContacts(id);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException(`Job with id ${id} not found`);
      }

      throw error;
    }
  }

  @Post()
  async createContact(
    @Param('id', ParseIntPipe) id: number,
    @Body() createContactDto: CreateContactDto,
  ): Promise<ContactDto> {
    try {
      return await this.jobsService.createContact(id, createContactDto);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException(`Job with id ${id} not found`);
      }

      throw error;
    }
  }

  @Patch(':contactId')
  async updateContact(
    @Param('id', ParseIntPipe) id: number,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<ContactDto> {
    try {
      return await this.jobsService.updateContact(
        id,
        contactId,
        updateContactDto,
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException(
          `Contact with id ${contactId} not found for job ${id}`,
        );
      }

      throw error;
    }
  }

  @Delete(':contactId')
  async deleteContact(
    @Param('id', ParseIntPipe) id: number,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<void> {
    try {
      await this.jobsService.deleteContact(id, contactId);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException(
          `Contact with id ${contactId} not found for job ${id}`,
        );
      }

      throw error;
    }
  }
}
