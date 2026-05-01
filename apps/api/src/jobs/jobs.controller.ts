import {
  ContactDto,
  CreateContactDto,
  CreateJobDto,
  JobDto,
  UpdateContactDto,
  UpdateJobStatusDto,
} from '@job-tracker-lite-angular/api-interfaces';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  Post,
} from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll(): Promise<JobDto[]> {
    return this.jobsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<JobDto> {
    try {
      return await this.jobsService.findOne(id);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException(`Job with id ${id} not found`);
      }

      throw error;
    }
  }

  @Post()
  async create(@Body() createJobDto: CreateJobDto): Promise<JobDto> {
    return this.jobsService.create(createJobDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<JobDto> {
    return this.jobsService.updateStatus(id, updateJobStatusDto.status);
  }

  @Get(':id/contacts')
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

  @Post(':id/contacts')
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

  @Patch(':jobId/contacts/:contactId')
  async updateContact(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<ContactDto> {
    try {
      return await this.jobsService.updateContact(
        jobId,
        contactId,
        updateContactDto,
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException(
          `Contact with id ${contactId} not found for job ${jobId}`,
        );
      }

      throw error;
    }
  }

  @Delete(':jobId/contacts/:contactId')
  async deleteContact(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<void> {
    try {
      await this.jobsService.deleteContact(jobId, contactId);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException(
          `Contact with id ${contactId} not found for job ${jobId}`,
        );
      }

      throw error;
    }
  }
}
