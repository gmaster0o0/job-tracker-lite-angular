import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { NotesController } from './notes.controller';
import { ContactsController } from './contacts.contoller';

@Module({
  controllers: [JobsController, NotesController, ContactsController],
  providers: [JobsService],
})
export class JobsModule {}
