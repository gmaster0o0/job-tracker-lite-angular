import { NoteDto } from '@job-tracker-lite-angular/api-interfaces';
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
import { ParseCuidPipe } from '@job-tracker-lite-angular/core-utils';
import { CreateNoteDtoRequest, UpdateNoteDtoRequest } from './dto/notes.dto';

@Controller('jobs/:id/notes')
export class NotesController {
  constructor(private readonly jobsService: JobsService) {}

  @Delete(':noteId')
  async deleteNote(
    @Param('id', ParseCuidPipe) id: string,
    @Param('noteId', ParseCuidPipe) noteId: string,
  ): Promise<void> {
    return await this.jobsService.deleteNote(id, noteId);
  }

  @Patch(':noteId')
  async updateNote(
    @Param('id', ParseCuidPipe) id: string,
    @Param('noteId', ParseCuidPipe) noteId: string,
    @Body() updatedNote: UpdateNoteDtoRequest,
  ): Promise<NoteDto> {
    return await this.jobsService.updateNote(id, noteId, updatedNote);
  }

  @Post()
  async createNote(
    @Param('id', ParseCuidPipe) id: string,
    @Body() createNoteDto: CreateNoteDtoRequest,
  ): Promise<NoteDto> {
    return await this.jobsService.createNote(id, createNoteDto);
  }

  @Get()
  async findNotes(@Param('id', ParseCuidPipe) id: string): Promise<NoteDto[]> {
    return await this.jobsService.findNotes(id);
  }
}
