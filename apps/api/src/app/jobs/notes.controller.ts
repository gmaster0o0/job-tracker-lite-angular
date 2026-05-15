import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import {
  CreateNoteDto,
  UpdateNoteDto,
  jobIdParamSchema,
} from '@job-tracker-lite-angular/schemas';
import { NoteDto } from '@job-tracker-lite-angular/api-interfaces';
import { JobsService } from './jobs.service';
import { ZodValidationPipe } from '@job-tracker-lite-angular/core-utils';

@Controller('jobs/:id/notes')
export class NotesController {
  constructor(private readonly jobsService: JobsService) {}

  @Delete(':noteId')
  async deleteNote(
    @Param('id', new ZodValidationPipe(jobIdParamSchema)) id: string,
    @Param('noteId', new ZodValidationPipe(jobIdParamSchema)) noteId: string,
  ): Promise<void> {
    return await this.jobsService.deleteNote(id, noteId);
  }

  @Patch(':noteId')
  async updateNote(
    @Param('id', new ZodValidationPipe(jobIdParamSchema)) id: string,
    @Param('noteId', new ZodValidationPipe(jobIdParamSchema)) noteId: string,
    @Body() updatedNote: UpdateNoteDto,
  ): Promise<NoteDto> {
    return await this.jobsService.updateNote(id, noteId, updatedNote);
  }

  @Post()
  async createNote(
    @Param('id', new ZodValidationPipe(jobIdParamSchema)) id: string,
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<NoteDto> {
    return await this.jobsService.createNote(id, createNoteDto);
  }

  @Get()
  async findNotes(
    @Param('id', new ZodValidationPipe(jobIdParamSchema)) id: string,
  ): Promise<NoteDto[]> {
    return await this.jobsService.findNotes(id);
  }
}
