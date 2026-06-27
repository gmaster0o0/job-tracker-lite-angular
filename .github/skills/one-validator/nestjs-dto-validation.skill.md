---
name: nestjs-dto-validation
description: 'Guide for using the one-validator concept in NestJS with Zod schemas, shared core-utils decorators, and a NestJS-friendly validation experience.'
argument-hint: 'Use Zod schemas for DTO validation and NestJS decorators/pipes.'
user-invocable: true
---

# NestJS DTO Validation with Zod

This skill captures the **one-validator concept** used in this repository:
- Define validation once in shared Zod schemas.
- Reuse the same schema types for DTOs and controller validation.
- Use `@job-tracker-lite-angular/core-utils` decorators and pipes for NestJS-friendly integration.
- Combine this skill with `one-validator-schema` for shared schema design and validation patterns.

## How to use this skill

1. First invoke the `one-validator-schema` skill for shared Zod schema creation and rules.
2. Then use this skill for NestJS DTO validation wiring, decorators, and server-side parsing.
3. Keep schema logic in `libs/shared/schemas/` and controller plumbing in `apps/api/`.

## When to use

- Creating or updating NestJS DTOs
- Validating request bodies and route parameters
- Reusing shared Zod schemas across API and frontend
- Adding custom validation logic with `superRefine`
- Implementing type-safe request handling

## Workflow

### 1. Create Zod schemas in shared schemas

Put schema definitions in `libs/shared/schemas/src/lib/schemas/<entity>.schema.ts`.

Example:

```ts
import { z } from 'zod';
import { required } from '../validators/required';
import { emptyStringToNull } from '../validators/empty-string-to-null';
import { errorCodes } from '../error-codes';

export const createContactSchema = z
  .object({
    name: required,
    email: emptyStringToNull(z.email().nullable()),
    phoneNumber: emptyStringToNull(z.e164().nullable()),
  })
  .superRefine((data, ctx) => {
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
  });

export type CreateContactDto = z.infer<typeof createContactSchema>;
```

### 2. Reuse shared validators

Use common validators so schema definitions stay consistent.

- `required` for trimmed required strings
- `emptyStringToNull(...)` to normalize empty form inputs

Example:

```ts
const schema = z.object({
  name: required,
  email: emptyStringToNull(z.email().nullable()),
});
```

### 3. Use decorators in controllers

Import validation decorators from `@job-tracker-lite-angular/core-utils`.

```ts
import { ZodBody, ZodParam } from '@job-tracker-lite-angular/core-utils';
import {
  createContactSchema,
  updateContactSchema,
  contactIdParamSchema,
  jobIdParamSchema,
  CreateContactDto,
  UpdateContactDto,
} from '@job-tracker-lite-angular/schemas';

@Post()
async createContact(
  @ZodParam('id', jobIdParamSchema) id: string,
  @ZodBody(createContactSchema) createContactDto: CreateContactDto,
) {
  return this.jobsService.createContact(id, createContactDto);
}

@Patch(':contactId')
async updateContact(
  @ZodParam('id', jobIdParamSchema) id: string,
  @ZodParam('contactId', contactIdParamSchema) contactId: string,
  @ZodBody(updateContactSchema) updateContactDto: UpdateContactDto,
) {
  return this.jobsService.updateContact(id, contactId, updateContactDto);
}
```

## Core utilities

### `ZodBody(schema)`

- Applies Zod validation to request body
- Returns typed DTO after validation
- Throws `BadRequestException` when invalid

### `ZodParam(name, schema)`

- Validates route parameters
- Keeps controller handlers strongly typed

### `ZodValidationPipe`

The shared pipe does the actual parse and error handling.

```ts
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }
    return result.data;
  }
}
```

## Best practices

- Use schema types with `z.infer<typeof schema>` for DTO params.
- Keep validation logic in shared schemas, not in controllers.
- Add route param schemas for IDs and validated params.
- Use `partial()` for update DTOs.
- Use `superRefine()` for cross-field or conditional validation.

## Checklist

- [ ] Define shared Zod schema in `libs/shared/schemas`
- [ ] Export schema and inferred DTO type
- [ ] Use `required` and `emptyStringToNull` where appropriate
- [ ] Add custom validation with `superRefine` if needed
- [ ] Use `ZodBody` for request bodies
- [ ] Use `ZodParam` for route params
- [ ] Keep controllers clean and type-safe

## Related files

- `libs/shared/core-utils/src/lib/decorators/zod-decorator.ts`
- `libs/shared/core-utils/src/lib/pipes/zod-validation.pipe.ts`
- `libs/shared/schemas/src/lib/validators/required.ts`
- `libs/shared/schemas/src/lib/validators/empty-string-to-null.ts`
- `apps/api/src/app/jobs/contacts.controller.ts`
