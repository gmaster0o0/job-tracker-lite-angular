---
name: one-validator-schema
description: Create Zod 4 schemas for backend and frontend validation. USE WHEN user wants to create or edit Zod schemas for data structures, DTOs, API validation, or form validation.
---

# Zod 4 Schema Creation Guide

This skill guides you through creating Zod schemas in this project using **Zod 4** syntax.

## 🚨 Critical: Zod 4 Breaking Changes

**ALWAYS use Zod 4 syntax.** Many AI suggestions use deprecated Zod 3 patterns. This project uses `zod@^4.4.3`.

### Common Deprecated Patterns (DO NOT USE)

❌ **WRONG (Zod 3 - Deprecated):**
```typescript
z.email()           // ❌ Direct method no longer exists
z.cuid2()           // ❌ Direct method no longer exists  
z.url()             // ❌ Direct method no longer exists
z.iso.datetime()    // ❌ The `iso` namespace was removed
z.e164()            // ❌ Direct method no longer exists
z.uuid()            // ❌ Direct method no longer exists
```

✅ **CORRECT (Zod 4):**
```typescript
z.string().email()       // ✅ Email validation on string
z.string().cuid2()       // ✅ CUID2 validation on string
z.string().url()         // ✅ URL validation on string
z.string().datetime()    // ✅ ISO datetime (no `iso` namespace)
z.string().e164()        // ✅ E.164 phone format on string
z.string().uuid()        // ✅ UUID validation on string
```

### Migration Quick Reference

| Deprecated (Zod 3) | Zod 4 Replacement |
|-------------------|-------------------|
| `z.email()` | `z.string().email()` |
| `z.cuid2()` | `z.string().cuid2()` |
| `z.url()` | `z.string().url()` |
| `z.uuid()` | `z.string().uuid()` |
| `z.e164()` | `z.string().e164()` |
| `z.iso.datetime()` | `z.string().datetime()` |
| `z.iso.date()` | `z.string().date()` |
| `z.iso.time()` | `z.string().time()` |

## 📁 Project Structure

### Location
All schemas are located in: `libs/shared/schemas/src/lib/`

### Directory Structure
```
libs/shared/schemas/src/lib/
├── error-codes.ts           # Centralized validation error codes
├── validators/              # Reusable custom validators
│   ├── index.ts            # Export all validators
│   ├── required.ts         # Required field validator
│   └── empty-string-to-null.ts
└── schemas/                 # Domain-specific schemas
    ├── index.ts            # Export all schemas
    ├── auth.schema.ts      # Authentication schemas
    ├── users.schema.ts     # User-related schemas
    ├── jobs.schema.ts      # Job-related schemas
    └── contacts.schema.ts  # Contact schemas
```

### One Schema Per Domain
- **Create separate files** for each domain (auth, users, jobs, contacts, etc.)
- **File naming**: Use `{domain}.schema.ts` format
- **Export all** schemas and DTOs from the file
- **Export from index**: Add to `schemas/index.ts` for easy importing

## 🏗️ Schema Building Patterns

### 1. Basic Schema with DTO

Every schema must have a corresponding DTO type using `z.infer`:

```typescript
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().cuid2(),                    // ✅ Zod 4 syntax
  email: z.string().email(),                 // ✅ Zod 4 syntax
  name: z.string(),
  createdAt: z.string().datetime(),          // ✅ Zod 4 syntax (no `iso`)
});

export type UserDto = z.infer<typeof userSchema>;
```

### 2. Custom Validators with Error Codes

**Every custom validation MUST include an `errorCode`** for consistent error handling.

#### Import Error Codes
```typescript
import { errorCodes } from '../error-codes';
```

#### Define Error Codes First
Add new error codes to `error-codes.ts`:
```typescript
export const errorCodes = {
  required: 'required',
  need_number: 'need_number',
  need_uppercase: 'need_uppercase',
  password_mismatch: 'password_mismatch',
  required_one_of: 'required_one_of',
  // Add your new error codes here
};
```

#### Create Custom Validator
Use `superRefine` for custom validation:

```typescript
import { z } from 'zod';
import { errorCodes } from '../error-codes';

export const required = z.string().superRefine((value, ctx) => {
  if (!value || value.trim().length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'This field is required',
      errorCode: errorCodes.required,  // ✅ Always include errorCode
    });
  }
});
```

### 3. Complex Schema with Validation

Example: Password validation with multiple requirements

```typescript
import { z } from 'zod';
import { errorCodes } from '../error-codes';

const hasNumber = (value: string): boolean => /\d/.test(value);
const hasUppercase = (value: string): boolean => /[A-Z]/.test(value);
const hasLowercase = (value: string): boolean => /[a-z]/.test(value);

export const MIN_PASSWORD_LENGTH = 8;

export const basicPasswordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH)
  .superRefine((value, ctx) => {
    if (!hasNumber(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one number',
        errorCode: errorCodes.need_number,
      });
    }

    if (!hasUppercase(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one uppercase letter',
        errorCode: errorCodes.need_uppercase,
      });
    }

    if (!hasLowercase(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one lowercase letter',
        errorCode: errorCodes.need_lowercase,
      });
    }
  });

export type BasicPasswordDto = z.infer<typeof basicPasswordSchema>;
```

### 4. Cross-Field Validation

Use `superRefine` on the object for validating multiple fields:

```typescript
export const registerSchema = z
  .object({
    name: required,
    email: required.pipe(z.string().email()),  // ✅ Combine validators with pipe
    password: basicPasswordSchema,
    confirmPassword: required,
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password confirmation must match password',
        path: ['confirmPassword'],              // Target specific field
        errorCode: errorCodes.password_mismatch,
      });
    }
  });

export type RegisterDto = z.infer<typeof registerSchema>;
```

### 5. Required One Of Pattern

Validate that at least one field is provided:

```typescript
const baseContactSchema = z.object({
  name: required,
  email: emptyStringToNull(z.string().email().nullable()),
  phoneNumber: emptyStringToNull(z.string().e164().nullable()),  // ✅ Zod 4 syntax
});

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
```

### 6. Using Reusable Validators

Import and compose validators:

```typescript
import { required, emptyStringToNull } from '../validators';

export const createJobSchema = z.object({
  position: required,                                    // Reusable validator
  company: required,                                     // Reusable validator
  link: emptyStringToNull(z.string().url().nullable()), // ✅ Zod 4 + custom
  description: z.string().nullable(),
  status: jobStatusSchema.default(JobStatus.SAVED),
});

export type CreateJobDto = z.infer<typeof createJobSchema>;
```

### 7. Deriving Schemas

Create related schemas using `.partial()`, `.pick()`, `.omit()`:

```typescript
// Base schema
export const createJobSchema = z.object({
  position: required,
  company: required,
  link: emptyStringToNull(z.string().url().nullable()),  // ✅ Zod 4
  description: z.string().nullable(),
  status: jobStatusSchema.default(JobStatus.SAVED),
});

// Update schema (all fields optional)
export const updateJobSchema = createJobSchema.partial();
export type UpdateJobDto = z.infer<typeof updateJobSchema>;

// Partial update
export const updateJobStatusSchema = z.object({
  status: jobStatusSchema,
});
export type UpdateJobStatusDto = z.infer<typeof updateJobStatusSchema>;
```

### 8. Enums

Use `z.enum()` for enumerated values:

```typescript
import { JobStatus as PrismaJobStatus } from '@prisma/client';

export const jobStatusSchema = z.enum(PrismaJobStatus);
export type JobStatusDto = z.infer<typeof jobStatusSchema>;

// Re-export to hide Prisma implementation
export const JobStatus = PrismaJobStatus;

// Or define custom enum
export const supportLangSchema = z.enum(['en', 'hu']);
export type SupportLang = z.infer<typeof supportLangSchema>;
```

### 9. URL Parameters

For route parameters (like IDs):

```typescript
export const jobIdParamSchema = z.string().cuid2();    // ✅ Zod 4 syntax
export const contactIdParamSchema = z.string().cuid2(); // ✅ Zod 4 syntax
```

## 📋 Checklist

When creating a new schema, ensure:

- [ ] Using **Zod 4 syntax** (e.g., `z.string().email()`, not `z.email()`)
- [ ] File is in `libs/shared/schemas/src/lib/schemas/{domain}.schema.ts`
- [ ] Every schema has a corresponding DTO type using `z.infer`
- [ ] Custom validators use `superRefine` and include `errorCode`
- [ ] Error codes are defined in `error-codes.ts`
- [ ] Validators are exported from `validators/index.ts`
- [ ] Schema is exported from `schemas/index.ts`
- [ ] No deprecated `z.iso.*` methods (use `z.string().datetime()` instead)
- [ ] Nullable fields use `.nullable()` or `.optional()`
- [ ] Required fields use the `required` validator or are non-nullable

## 🔄 Schema-DTO Relationship

**Every schema must have a DTO:**

```typescript
// Schema definition
export const loginSchema = z.object({
  email: required.pipe(z.string().email()),  // ✅ Zod 4
  password: required,
});

// DTO type - ALWAYS derive with z.infer
export type LoginDto = z.infer<typeof loginSchema>;
```

**Benefits:**
- Type-safe data transfer objects
- Automatic type inference
- Consistent validation across frontend and backend
- Single source of truth

## 💡 Best Practices

1. **Always use Zod 4 syntax** - double-check string validators
2. **One domain per file** - keep schemas organized
3. **Reuse validators** - create validators for common patterns
4. **Include error codes** - every custom validation needs an errorCode
5. **Export DTOs** - always provide `z.infer` types
6. **Use `.pipe()`** - chain validators cleanly
7. **Document complex logic** - add comments for business rules
8. **Test edge cases** - especially for cross-field validation

## 🎯 When to Use This Skill

- Creating new API endpoints that need validation
- Adding form validation schemas
- Defining data transfer objects (DTOs)
- Migrating from Zod 3 to Zod 4
- Adding custom validators
- Validating user input
- Ensuring type safety across frontend/backend