import {
  CreateJobDto,
  JobDto,
  UpdateJobDto,
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

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<JobDto> {
    try {
      return await this.jobsService.update(id, updateJobDto);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException(`Job with id ${id} not found`);
      }

      throw error;
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.jobsService.delete(id);
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        throw new NotFoundException(`Job with id ${id} not found`);
      }

      throw error;
    }
  }
}
