import {
  CreateJobDto,
  JobDto,
  UpdateJobStatusDto,
} from '@job-tracker-lite-angular/api-interfaces';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
}
