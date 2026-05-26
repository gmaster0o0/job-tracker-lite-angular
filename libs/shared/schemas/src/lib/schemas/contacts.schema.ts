import { z } from 'zod';
import { emptyStringToNull } from '../validators/empty-string-to-null';
import { errorCodes } from '../error-codes';
import { required } from '../validators/required';

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
  name: required,
  email: emptyStringToNull(z.email().nullable()),
  phoneNumber: emptyStringToNull(z.e164().nullable()),
});

//create contact schema with DTO
export const createContactSchema = baseContactSchema.superRefine(
  (data, ctx) => {
    if (!data.email && !data.phoneNumber) {
      ctx.addIssue({
        code: 'custom',
        message: 'Email or phone number must be provided',
        path: ['email'],
        errorCode: errorCodes.required_one_of,
      });

      ctx.addIssue({
        code: 'custom',
        message: 'Email or phone number must be provided',
        path: ['phoneNumber'],
        errorCode: errorCodes.required_one_of,
      });
    }
  },
);
export type CreateContactDto = z.infer<typeof createContactSchema>;

//update contact schema with DTO
export const updateContactSchema = baseContactSchema.partial();
export type UpdateContactDto = z.infer<typeof updateContactSchema>;

//contact id param schema
export const contactIdParamSchema = z.cuid2();
