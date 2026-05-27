import { z } from 'zod';
import { required } from '../validators/required';

// Note schema with DTO
export const noteSchema = z.object({
  id: z.cuid2(),
  jobId: z.cuid2(),
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type NoteDto = z.infer<typeof noteSchema>;

// create note schema with DTO
export const createNoteSchema = z.object({
  title: required,
  body: required,
});
export type CreateNoteDto = z.infer<typeof createNoteSchema>;

// update note schema with DTO
export const updateNoteSchema = createNoteSchema.partial();
export type UpdateNoteDto = z.infer<typeof updateNoteSchema>;

export const noteIdParamSchema = z.cuid2();
