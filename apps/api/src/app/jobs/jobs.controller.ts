import { Controller, Get, Param, Patch, Delete, Post } from '@nestjs/common';
import { JobsService } from './jobs.service';
import {
  CreateJobDto,
  JobDto,
  JobStatusDto,
  UpdateJobDto,
  createJobSchema,
  jobIdParamSchema,
  updateJobSchema,
} from '@job-tracker-lite-angular/schemas';
import { ZodParam, ZodBody } from '@job-tracker-lite-angular/core-utils';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll(): Promise<JobDto[]> {
    return this.jobsService.findAll();
  }

  @Get(':id')
  async findOne(@ZodParam('id', jobIdParamSchema) id: string): Promise<JobDto> {
    return await this.jobsService.findOne(id);
  }

  @Post()
  async create(
    @ZodBody(createJobSchema) createJobDto: CreateJobDto,
  ): Promise<JobDto> {
    return this.jobsService.create(createJobDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodBody(updateJobSchema) updateJobStatusDto: { status: JobStatusDto },
  ): Promise<JobDto> {
    return this.jobsService.updateStatus(id, updateJobStatusDto.status);
  }

  @Patch(':id')
  async update(
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodBody(updateJobSchema) updateJobDto: UpdateJobDto,
  ): Promise<JobDto> {
    return await this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  async delete(@ZodParam('id', jobIdParamSchema) id: string): Promise<void> {
    await this.jobsService.delete(id);
  }
}
