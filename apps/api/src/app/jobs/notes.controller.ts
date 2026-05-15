import { Controller, Get, Post, Delete, Body, Patch } from '@nestjs/common';
import {
  CreateNoteDto,
  NoteDto,
  UpdateNoteDto,
  jobIdParamSchema,
  noteIdParamSchema,
} from '@job-tracker-lite-angular/schemas';
import { JobsService } from './jobs.service';
import { ZodParam } from '@job-tracker-lite-angular/core-utils';

@Controller('jobs/:id/notes')
export class NotesController {
  constructor(private readonly jobsService: JobsService) {}

  @Delete(':noteId')
  async deleteNote(
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodParam('noteId', noteIdParamSchema) noteId: string,
  ): Promise<void> {
    return await this.jobsService.deleteNote(id, noteId);
  }

  @Patch(':noteId')
  async updateNote(
    @ZodParam('id', jobIdParamSchema) id: string,
    @ZodParam('noteId', noteIdParamSchema) noteId: string,
    @Body() updatedNote: UpdateNoteDto,
  ): Promise<NoteDto> {
    return await this.jobsService.updateNote(id, noteId, updatedNote);
  }

  @Post()
  async createNote(
    @ZodParam('id', jobIdParamSchema) id: string,
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<NoteDto> {
    return await this.jobsService.createNote(id, createNoteDto);
  }

  @Get()
  async findNotes(
    @ZodParam('id', jobIdParamSchema) id: string,
  ): Promise<NoteDto[]> {
    return await this.jobsService.findNotes(id);
  }
}
