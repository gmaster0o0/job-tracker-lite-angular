import { z } from 'zod';

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
  title: z.string(),
  body: z.string(),
});
export type CreateNoteDto = z.infer<typeof createNoteSchema>;

// update note schema with DTO
export const updateNoteSchema = createNoteSchema.partial();
export type UpdateNoteDto = z.infer<typeof updateNoteSchema>;

export const noteIdParamSchema = z.object({
  id: z.cuid2(),
});
