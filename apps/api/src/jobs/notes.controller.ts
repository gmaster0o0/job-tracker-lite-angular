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

@Controller('jobs/:id/notes')
export class NotesController {
  constructor(private readonly jobsService: JobsService) {}

  @Delete(':noteId')
  async deleteNote(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
  ): Promise<void> {
    return await this.jobsService.deleteNote(id, noteId);
  }

  @Patch(':noteId')
  async updateNote(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Body() updatedNote: UpdateNoteDto,
  ): Promise<NoteDto> {
    return await this.jobsService.updateNote(id, noteId, updatedNote);
  }

  @Post()
  async createNote(
    @Param('id') id: string,
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<NoteDto> {
    return await this.jobsService.createNote(id, createNoteDto);
  }

  @Get()
  async findNotes(@Param('id') id: string): Promise<NoteDto[]> {
    return await this.jobsService.findNotes(id);
  }
}
