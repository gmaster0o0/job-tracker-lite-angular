import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  CreateNoteDto,
  NoteDto,
  UpdateNoteDto,
  createNoteSchema,
  jobIdParamSchema,
  noteIdParamSchema,
  updateNoteSchema,
} from '@job-tracker-lite-angular/schemas';
import { JobsService } from './jobs.service';
import { ZodBody, ZodParam } from '@job-tracker-lite-angular/core-utils';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller('jobs/:id/notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private readonly jobsService: JobsService) {}

  @Delete(':noteId')
  async deleteNote(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodParam('noteId', noteIdParamSchema) noteId: string,
  ): Promise<void> {
    return await this.jobsService.deleteNote(session.user.id, id, noteId);
  }

  @Patch(':noteId')
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
  async findNotes(
    @Session() session: UserSession,
    @ZodParam('id', jobIdParamSchema) id: string,
  ): Promise<NoteDto[]> {
    return await this.jobsService.findNotes(session.user.id, id);
  }
}
