import { z } from 'zod';

//Contact schema with DTO
export const contactSchema = z.object({
  id: z.cuid2(),
  jobId: z.cuid2(),
  name: z.string(),
  email: z.email().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ContactDto = z.infer<typeof contactSchema>;

//create contact schema with DTO
export const createContactSchema = z.object({
  name: z.string(),
  email: z.email().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
});
export type CreateContactDto = z.infer<typeof createContactSchema>;

//update contact schema with DTO
export const updateContactSchema = createContactSchema.partial();
export type UpdateContactDto = z.infer<typeof updateContactSchema>;
