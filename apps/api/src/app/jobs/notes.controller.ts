import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
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
import {
  CreateNoteDto,
  NoteDto,
  UpdateNoteDto,
  createNoteSchema,
  jobIdParamSchema,
  noteIdParamSchema,
  noteSchema,
  updateNoteSchema,
} from '@job-tracker-lite-angular/schemas';
import { JobsService } from './jobs.service';
import {
  ZodBody,
  ZodParam,
  zodToApiSchema,
} from '@job-tracker-lite-angular/core-utils';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@ApiTags('notes')
@ApiBearerAuth()
@Controller('jobs/:id/notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private readonly jobsService: JobsService) {}

  @Delete(':noteId')
  @ApiOperation({
    summary: 'Delete a note',
    description: 'Permanently deletes a note from a job application.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job application identifier (CUID2)',
    schema: zodToApiSchema(jobIdParamSchema),
  })
  @ApiParam({
    name: 'noteId',
    description: 'Note identifier (CUID2)',
    schema: zodToApiSchema(noteIdParamSchema),
  })
  async deleteNote(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodParam('noteId', noteIdParamSchema) noteId: string,
  ): Promise<void> {
    return await this.jobsService.deleteNote(session.user.id, id, noteId);
  }

  @Patch(':noteId')
  @ApiOperation({
    summary: 'Update a note',
    description: 'Partially updates the title and/or body of an existing note.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job application identifier (CUID2)',
    schema: zodToApiSchema(jobIdParamSchema),
  })
  @ApiParam({
    name: 'noteId',
    description: 'Note identifier (CUID2)',
    schema: zodToApiSchema(noteIdParamSchema),
  })
  @ApiBody({
    description: 'Fields to update on the note',
    schema: zodToApiSchema(updateNoteSchema),
  })
  @ApiOkResponse({ schema: zodToApiSchema(noteSchema) })
  async updateNote(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodParam('noteId', noteIdParamSchema) noteId: string,
    @ZodBody(updateNoteSchema) updatedNote: UpdateNoteDto,
  ): Promise<NoteDto> {
    return await this.jobsService.updateNote(
      session.user.id,
      id,
      noteId,
      updatedNote,
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Add a note to a job application',
    description: 'Creates a new note linked to the given job application.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job application identifier (CUID2)',
    schema: zodToApiSchema(jobIdParamSchema),
  })
  @ApiBody({
    description: 'Note to create',
    schema: zodToApiSchema(createNoteSchema),
  })
  @ApiOkResponse({ schema: zodToApiSchema(noteSchema) })
  async createNote(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodBody(createNoteSchema) createNoteDto: CreateNoteDto,
  ): Promise<NoteDto> {
    return await this.jobsService.createNote(
      session.user.id,
      id,
      createNoteDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List notes for a job application',
    description:
      'Returns every note associated with the given job application.',
  })
  @ApiParam({
    name: 'id',
    description: 'Job application identifier (CUID2)',
    schema: zodToApiSchema(jobIdParamSchema),
  })
  @ApiOkResponse({
    schema: { type: 'array', items: zodToApiSchema(noteSchema) },
  })
  async findNotes(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
  ): Promise<NoteDto[]> {
    return await this.jobsService.findNotes(session.user.id, id);
  }
}
