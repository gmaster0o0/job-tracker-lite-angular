---
name: angular-signal-forms
description: Create and edit Angular 21+ signal-based forms with Zod schema validation, Spartan UI components, and backend error handling. Works with `one-validator-schema` skill for schema creation. USE WHEN creating forms, editing form components, adding form validation, implementing form submission with error handling, working with reactive forms using signals.
argument-hint: 'form name or entity type (e.g., "contact form", "job application")'
---

# Angular 21+ Signal Forms with Schema Validation

Create type-safe, validated forms using Angular signal-based forms, Zod schemas, and Spartan UI components with minimal styling.

## When to Use

- Creating new forms for data input (create/edit dialogs, auth forms, settings)
- Adding validation to existing forms
- Implementing form submission with backend error handling
- Working with reactive forms using Angular 21+ signals
- Need schema validation that works on both frontend and backend
- Want consistent form structure with Spartan UI design system

## Core Principles

1. **Schema-driven validation**: Define Zod schemas in `libs/shared/schemas/` - reusable on frontend and backend
2. **Signal-based reactivity**: Use `signal()` for models and `form()` from `@angular/forms/signals`
3. **Spartan UI components**: Consistent design with minimal Tailwind classes
4. **Type safety**: TypeScript types inferred from Zod schemas
5. **Backend error integration**: Handle API errors with translation keys

## Step-by-Step Workflow

### 1. Check or Create Schema

**First, invoke the `one-validator-schema` skill** for detailed Zod schema creation guidance, including:
- Zod 4 syntax (critical breaking changes from Zod 3)
- Project structure and conventions
- Custom validators and error codes
- Cross-field validation patterns

**Quick reference** for existing schemas:
- **Location**: `libs/shared/schemas/src/lib/schemas/`
- **Check existing**: auth, jobs, contacts, users
- **Import pattern**: `import { createContactSchema } from '@job-tracker-lite-angular/schemas';`

**Common schema pattern for forms**:
```typescript
export const createContactSchema = z.object({
  name: required,
  email: emptyStringToNull(z.string().email().nullable()),
  phoneNumber: emptyStringToNull(z.string().e164().nullable()),
}).superRefine((data, ctx) => {
  // Cross-field validation if needed
});

export type CreateContactDto = z.infer<typeof createContactSchema>;
```

**Standard error codes** (from `libs/shared/schemas/src/lib/error-codes.ts`):
- `required`, `invalid_format`, `required_one_of`
- `password_mismatch`, `need_number`, `need_uppercase`, `need_lowercase`

### 2. Component Structure

**Required Imports**:

```typescript
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { form, validateStandardSchema, FormRoot, FormField } from '@angular/forms/signals';

// Spartan UI Components
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTextarea } from '@spartan-ng/helm/textarea'; // For textareas
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group'; // For grouped inputs

// Project-specific
import { ZodNgControlBridgeDirective, isBackendError } from '@job-tracker-lite-angular/frontend-data-access';
import { ServerErrorAlertComponent } from '@job-tracker-lite-angular/frontend-shared';
import { createContactSchema } from '@job-tracker-lite-angular/schemas';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-create-contact',
  imports: [CommonModule, ReactiveFormsModule, HlmInputImports, HlmFieldImports, HlmButtonImports, TranslocoModule, FormRoot, FormField, ZodNgControlBridgeDirective, ServerErrorAlertComponent],
  templateUrl: './create-contact.component.html',
})
export class CreateContactComponent {
  // ... see next step
}
```

**Component Class Pattern**:

```typescript
export class CreateContactComponent {
  private readonly dataAccess = inject(ContactsDataAccessService);
  private readonly router = inject(Router); // If navigation needed

  // State signals
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  // Form model signal - initialize with empty/default values
  protected readonly contactModel = signal({
    name: '',
    email: '',
    phoneNumber: '',
  });

  // Form with validation and submission
  protected readonly contactForm = form(this.contactModel, (path) => validateStandardSchema(path, createContactSchema), {
    submission: {
      action: async (data) => {
        this.isSubmitting.set(true);
        this.submitError.set(null);

        try {
          const result = await this.dataAccess.create(data().value());
          // Success: close dialog, navigate, or refresh
          this.dialogRef?.close(result);
        } catch (error) {
          // Backend error handling
          this.submitError.set(isBackendError(error) ? error.errorCode.toLowerCase() : 'unknown');
        } finally {
          this.isSubmitting.set(false);
        }
      },
    },
  });
}
```

### 3. Template Structure

**Form Container**:

```html
<form [formRoot]="contactForm" id="contactForm" class="space-y-4 py-4">
  <hlm-field-group>
    <!-- Fields go here -->
  </hlm-field-group>
</form>
```

**Text Input Field Pattern**:

```html
<hlm-field>
  <label hlmLabel for="name">{{ 'contacts.fields.name.label' | transloco }}</label>
  <input hlmInput libFormField id="name" type="text" [formField]="contactForm.name" placeholder="{{ 'contacts.fields.name.placeholder' | transloco }}" class="w-full" />
  @if ( contactForm.name().invalid() && (contactForm.name().touched() || contactForm.name().dirty()) ) {
  <hlm-field-error validator="required">{{ 'contacts.fields.name.required' | transloco }}</hlm-field-error>
  } @else {
  <p hlmDialogDescription>{{ 'contacts.fields.name.example' | transloco }}</p>
  }
</hlm-field>
```

**Email Input Field**:

```html
<hlm-field>
  <label hlmLabel for="email">{{ 'contacts.fields.email.label' | transloco }}</label>
  <input hlmInput libFormField id="email" type="email" [formField]="contactForm.email" placeholder="{{ 'contacts.fields.email.placeholder' | transloco }}" class="w-full" />
  @if ( contactForm.email().invalid() && (contactForm.email().touched() || contactForm.email().dirty()) ) {
  <hlm-field-error validator="invalid_format">{{ 'contacts.fields.email.invalid_format' | transloco }}</hlm-field-error>
  <hlm-field-error validator="required_one_of">{{ 'contacts.fields.email.required_one_of' | transloco }}</hlm-field-error>
  } @else {
  <p hlmDialogDescription>{{ 'contacts.fields.email.example' | transloco }}</p>
  }
</hlm-field>
```

**Textarea Field**:

```html
<hlm-field>
  <label hlmLabel for="description">{{ 'jobs.fields.description.label' | transloco }}</label>
  <textarea hlmTextarea libFormField id="description" [formField]="jobForm.description" placeholder="{{ 'jobs.fields.description.placeholder' | transloco }}" rows="4" class="min-h-[120px] h-[120px] [field-sizing:fixed] overflow-y-auto"></textarea>
  <p hlmDialogDescription>{{ 'jobs.fields.description.example' | transloco }}</p>
</hlm-field>
```

**Password Field with Visibility Toggle**:

```html
<hlm-field>
  <label hlmLabel for="password">{{ 'auth.fields.password.label' | transloco }}</label>
  <input hlmInput libFormField id="password" [type]="showPassword() ? 'text' : 'password'" [formField]="loginForm.password" placeholder="{{ 'auth.fields.password.placeholder' | transloco }}" class="w-full" />
  @if ( loginForm.password().invalid() && (loginForm.password().touched() || loginForm.password().dirty()) ) {
  <hlm-field-error validator="required">{{ 'auth.fields.password.required' | transloco }}</hlm-field-error>
  <hlm-field-error validator="need_number">{{ 'auth.fields.password.need_number' | transloco }}</hlm-field-error>
  <hlm-field-error validator="need_uppercase">{{ 'auth.fields.password.need_uppercase' | transloco }}</hlm-field-error>
  <hlm-field-error validator="need_lowercase">{{ 'auth.fields.password.need_lowercase' | transloco }}</hlm-field-error>
  } @else {
  <p hlmDialogDescription>{{ 'auth.fields.password.example' | transloco }}</p>
  }
</hlm-field>
```

**Validation Error Display**:

To use the Angulars's `validator` attribute in `<hlm-field-error>`, you need to add the `ZodNgControlBridgeDirective` to your component imports. This directive bridges Zod validation errors to Angular form controls.

### 4. Backend Error Handling

**Add ServerErrorAlertComponent** (after all fields, inside `<hlm-field-group>`):

```html
<app-server-error-alert [errorMessage]="submitError()" translationPrefix="contacts.create" cssClass="w-full" />
```

**Translation Keys Pattern**:


```json
// i18n files
{
  "contacts": {
    "create": {
      "error": {
        "title": "Failed to Create Contact",
        "unknown": "An unexpected error occurred",
        "duplicate": "A contact with this email already exists",
        "invalid_phone": "Invalid phone number format"
      }
    }
  }
}
```

### 5. Submit Button Patterns

**Dialog Footer Button**:

```html
<!-- Use existing dialog footer components -->
<app-create-job-dialog-footer formId="contactForm" [disableSubmit]="contactForm().invalid()" [isSubmitting]="isSubmitting()" />
```

**Standalone Submit Button**:

```html
<button hlmBtn type="submit" form="contactForm" [disabled]="contactForm().invalid() || isSubmitting()" class="w-full">
  @if (isSubmitting()) {
  <ng-icon hlm name="lucideLoader2" size="sm" class="animate-spin" />
  {{ 'contacts.create.submitting' | transloco }} } @else { {{ 'contacts.create.submit' | transloco }} }
</button>
```

## Styling Guidelines

**Minimal Tailwind Classes**:

- Forms: `space-y-4 py-4`
- Inputs: `w-full` (width), optionally `min-h-[...]` for textareas
- Buttons: `w-full` for primary actions
- No custom colors, borders, or spacing - let Spartan UI handle it

**Do NOT**:

- Add custom border classes (`border-gray-300`)
- Add custom padding/margin beyond structural needs
- Override Spartan UI colors
- Use arbitrary values excessively

## Common Patterns

### Edit Form (Pre-filled Values)

```typescript
// Initialize model with existing data
protected readonly contactModel = signal({
  name: this.existingContact.name,
  email: this.existingContact.email ?? '',
  phoneNumber: this.existingContact.phoneNumber ?? '',
});

// Update action in form submission
action: async (data) => {
  await this.dataAccess.update(this.contactId, data().value());
}
```

### Conditional Required Fields

For complex schema validation (cross-field, conditional logic), refer to the `one-validator-schema` skill.

**Template handling** for conditional errors:
```html
<hlm-field-error validator="required_one_of">{{
  'contacts.fields.email.required_one_of' | transloco
}}</hlm-field-error>
```

### Multi-step Form Success State

```typescript
protected readonly isSuccess = signal(false);

// In submission action
try {
  await this.dataAccess.submit(data().value());
  this.isSuccess.set(true);
} catch (error) {
  this.submitError.set(/* error code */);
}
```

```html
@if (isSuccess()) {
<p class="text-sm text-emerald-600">{{ 'form.success' | transloco }}</p>
}
```

## Validation Helpers

**For complete schema validation patterns**, see the `one-validator-schema` skill.

**Quick reference**:
- **Custom validators**: `required`, `emptyStringToNull()`
- **Zod 4 string validators**: `.email()`, `.url()`, `.e164()`, `.datetime()`, `.cuid2()`, `.uuid()`
- **String constraints**: `.min(n)`, `.max(n)`, `.length(n)`
- **Chaining**: `.pipe()` for validator composition

## Checklist

**Schema** (see `one-validator-schema` skill for details):
- [ ] Schema exists or created in `libs/shared/schemas/src/lib/schemas/`
- [ ] Schema exported from `libs/shared/schemas/src/index.ts`
- [ ] DTOs exported with `z.infer<typeof schema>`

**Component**:
- [ ] Component imports: `FormRoot`, `FormField`, `ReactiveFormsModule`
- [ ] Spartan UI imports: `HlmInputImports`, `HlmFieldImports`
- [ ] `ZodNgControlBridgeDirective` imported and added to component imports
- [ ] Model signal initialized with correct shape
- [ ] Form created with `form(model, validator, { submission: { action } })`
- [ ] Template uses `[formRoot]` and `[formField]` bindings
- [ ] Error conditions check `invalid()`, `touched()`, `dirty()`
- [ ] `<hlm-field-error validator="...">` for each error type
- [ ] `ServerErrorAlertComponent` added for backend errors
- [ ] Submit button disabled when form invalid or submitting
- [ ] Translation keys defined for all labels, placeholders, errors

## Examples in Codebase

Reference these components for complete examples:

- **Simple form**: `apps/frontend/src/app/features/auth/login/login.component.ts`
- **Complex validation**: `apps/frontend/src/app/features/auth/register/register.component.ts`
- **Optional fields**: `apps/frontend/src/app/features/jobs/contacts/create-contact/create-contact.component.ts`
- **Textarea usage**: `apps/frontend/src/app/features/jobs/create-job/create-job.component.ts`
- **Multiple forms**: `apps/frontend/src/app/features/settings/account-settings/account-settings.component.ts`

## Troubleshooting

**Error not showing**: Check that validator name in `<hlm-field-error validator="...">` matches the `errorCode` in schema

**Form not validating**: Ensure `ZodNgControlBridgeDirective` is in component imports array

**Backend error not displaying**: Verify error code is lowercase in `submitError.set()`

**Type errors**: Regenerate schema types - ensure schema is exported and imported correctly
