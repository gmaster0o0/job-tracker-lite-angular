import {
  CreateNoteDto,
  NoteDto,
  UpdateNoteDto,
} from '@job-tracker-lite-angular/api-interfaces';
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { create } from 'domain';

@Controller('notes')
export class NotesController {
  constructor(private readonly jobsService: JobsService) {}

  @Delete(':noteId')
  async deleteNote(
    @Param('id') id: number,
    @Param('noteId') noteId: number,
  ): Promise<void> {
    return await this.jobsService.deleteNote(id, noteId);
  }

  @Patch(':noteId')
  async updateNote(
    @Param('id') id: number,
    @Param('noteId') noteId: number,
    @Body() updatedNote: UpdateNoteDto,
  ): Promise<NoteDto> {
    return await this.jobsService.updateNote(id, noteId, updatedNote);
  }

  @Post()
  async createNote(
    @Param('id') id: number,
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<NoteDto> {
    return await this.jobsService.createNote(id, createNoteDto);
  }

  @Get()
  async findNotes(@Param('id') id: number): Promise<NoteDto[]> {
    return await this.jobsService.findNotes(id);
  }
}
