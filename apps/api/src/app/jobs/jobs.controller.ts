import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Post,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import {
  CreateJobsDtoRequest,
  UpdateJobsDtoRequest,
  UpdateJobsStatusDtoRequest,
} from './dto/jobs.dto';
import { JobDto } from '@job-tracker-lite-angular/api-interfaces';
import { ParseCuidPipe } from '@job-tracker-lite-angular/core-utils';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll(): Promise<JobDto[]> {
    return this.jobsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseCuidPipe) id: string): Promise<JobDto> {
    return await this.jobsService.findOne(id);
  }

  @Post()
  async create(@Body() createJobDto: CreateJobsDtoRequest): Promise<JobDto> {
    return this.jobsService.create(createJobDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseCuidPipe) id: string,
    @Body() updateJobStatusDto: UpdateJobsStatusDtoRequest,
  ): Promise<JobDto> {
    return this.jobsService.updateStatus(id, updateJobStatusDto.status);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseCuidPipe) id: string,
    @Body() updateJobDto: UpdateJobsDtoRequest,
  ): Promise<JobDto> {
    return await this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseCuidPipe) id: string): Promise<void> {
    await this.jobsService.delete(id);
  }
}
