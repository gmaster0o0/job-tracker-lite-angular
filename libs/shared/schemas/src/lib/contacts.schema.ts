import { z } from 'zod';

//Contact schema with DTO
export const contactSchema = z.object({
  id: z.cuid2(),
  jobId: z.cuid2(),
  name: z.string(),
  email: z.email().nullable(),
  phoneNumber: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ContactDto = z.infer<typeof contactSchema>;

const baseContactSchema = z.object({
  name: z.string(),
  email: z.email().nullable(),
  phoneNumber: z.string().nullable(),
});

//create contact schema with DTO
export const createContactSchema = baseContactSchema.superRefine(
  (data, ctx) => {
    if (!data.email && !data.phoneNumber) {
      ctx.addIssue({
        code: 'custom',
        message: 'Email or phone number must be provided',
        path: ['email'],
      });

      ctx.addIssue({
        code: 'custom',
        message: 'Email or phone number must be provided',
        path: ['phoneNumber'],
      });
    }
  },
);
export type CreateContactDto = z.infer<typeof createContactSchema>;

//update contact schema with DTO
export const updateContactSchema = baseContactSchema.partial();
export type UpdateContactDto = z.infer<typeof updateContactSchema>;

//contact id param schema
export const contactIdParamSchema = z.object({
  id: z.cuid2(),
});
