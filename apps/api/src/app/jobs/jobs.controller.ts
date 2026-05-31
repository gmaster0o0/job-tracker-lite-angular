import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller('jobs')
@UseGuards(AuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll(@Session() session: UserSession): Promise<JobDto[]> {
    return this.jobsService.findAll(session.user.id);
  }

  @Get(':id')
  async findOne(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
  ): Promise<JobDto> {
    return await this.jobsService.findOne(session.user.id, id);
  }

  @Post()
  async create(
    @Session() session: UserSession,
    @ZodBody(createJobSchema) createJobDto: CreateJobDto,
  ): Promise<JobDto> {
    return this.jobsService.create(session.user.id, createJobDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodBody(updateJobSchema) updateJobStatusDto: { status: JobStatusDto },
  ): Promise<JobDto> {
    return this.jobsService.updateStatus(
      session.user.id,
      id,
      updateJobStatusDto.status,
    );
  }

  @Patch(':id')
  async update(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodBody(updateJobSchema) updateJobDto: UpdateJobDto,
  ): Promise<JobDto> {
    return await this.jobsService.update(session.user.id, id, updateJobDto);
  }

  @Delete(':id')
  async delete(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
  ): Promise<void> {
    await this.jobsService.delete(session.user.id, id);
  }
}
