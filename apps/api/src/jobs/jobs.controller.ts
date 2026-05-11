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
  Param,
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
  async findOne(@Param('id') id: string): Promise<JobDto> {
    return await this.jobsService.findOne(id);
  }

  @Post()
  async create(@Body() createJobDto: CreateJobDto): Promise<JobDto> {
    return this.jobsService.create(createJobDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<JobDto> {
    return this.jobsService.updateStatus(id, updateJobStatusDto.status);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<JobDto> {
    return await this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.jobsService.delete(id);
  }
}
