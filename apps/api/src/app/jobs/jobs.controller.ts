import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import {
  CreateJobDto,
  JobDto,
  JobStatusDto,
  UpdateJobDto,
  createJobSchema,
  jobIdParamSchema,
  jobSchema,
  updateJobSchema,
} from '@job-tracker-lite-angular/schemas';
import {
  ZodParam,
  ZodBody,
  zodToApiSchema,
} from '@job-tracker-lite-angular/core-utils';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
@UseGuards(AuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({
    summary: 'List job applications',
    description:
      'Returns every job application owned by the authenticated user.',
  })
  @ApiOkResponse({
    schema: { type: 'array', items: zodToApiSchema(jobSchema) },
  })
  async findAll(@Session() session: UserSession): Promise<JobDto[]> {
    return this.jobsService.findAll(session.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job application by id' })
  @ApiParam({
    name: 'id',
    description: 'Job application identifier (CUID2)',
    schema: zodToApiSchema(jobIdParamSchema),
  })
  @ApiOkResponse({ schema: zodToApiSchema(jobSchema) })
  async findOne(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
  ): Promise<JobDto> {
    return await this.jobsService.findOne(session.user.id, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a job application',
    description:
      'Creates a new job application owned by the authenticated user.',
  })
  @ApiBody({
    description: 'Job application to create',
    schema: zodToApiSchema(createJobSchema),
  })
  @ApiOkResponse({ schema: zodToApiSchema(jobSchema) })
  async create(
    @Session() session: UserSession,
    @ZodBody(createJobSchema) createJobDto: CreateJobDto,
  ): Promise<JobDto> {
    return this.jobsService.create(session.user.id, createJobDto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update a job application status',
    description:
      'Moves a job application to a different stage of the pipeline (e.g. applied, interviewing, offer, rejected).',
  })
  @ApiParam({
    name: 'id',
    description: 'Job application identifier (CUID2)',
    schema: zodToApiSchema(jobIdParamSchema),
  })
  @ApiBody({
    description: 'New status for the job application',
    schema: zodToApiSchema(updateJobSchema),
  })
  @ApiOkResponse({ schema: zodToApiSchema(jobSchema) })
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
  @ApiOperation({
    summary: 'Update a job application',
    description: 'Partially updates the fields of an existing job application.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job application identifier (CUID2)',
    schema: zodToApiSchema(jobIdParamSchema),
  })
  @ApiBody({
    description: 'Fields to update on the job application',
    schema: zodToApiSchema(updateJobSchema),
  })
  @ApiOkResponse({ schema: zodToApiSchema(jobSchema) })
  async update(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodBody(updateJobSchema) updateJobDto: UpdateJobDto,
  ): Promise<JobDto> {
    return await this.jobsService.update(session.user.id, id, updateJobDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a job application',
    description:
      'Permanently deletes a job application, along with its notes and contacts.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job application identifier (CUID2)',
    schema: zodToApiSchema(jobIdParamSchema),
  })
  async delete(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
  ): Promise<void> {
    await this.jobsService.delete(session.user.id, id);
  }
}
