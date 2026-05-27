# Testing Best Practices: Centralized Test Data & Fixtures

## Problem: Hardcoded Test Data Anti-Pattern

❌ **DON'T do this:**

```typescript
it('should show validation error if email is invalid', async () => {
  await harness.fillForm({
    name: 'John Doe',
    email: 'not-an-email',
    phoneNumber: '+3612345678',
  });
  await harness.submit();
  expect(await harness.getEmailErrorText()).toBeTruthy();
});
```
❌ **DON'T do this:** **DONT RUN THE TEST WITH PNPM**

### Issues with Hardcoding Test Data:

1. **Not DRY** — Test data is duplicated across test files
2. **Hard to maintain** — Changing test data requires updating multiple files
3. **Inconsistent** — Different tests may use different data for the same scenario
4. **Unclear intent** — New developers don't know if specific values matter
5. **Breaking changes** — Changes to test data break all dependent tests
6. **No documentation** — No single source of truth for test scenarios

---

## Solution: Centralized Test Fixtures Library

✅ **DO this instead:**

### Step 1: Create Fixtures in `libs/shared/testing`

All test data lives in a centralized, reusable library under `libs/shared/testing/src/lib/fixtures/`.

**Example: `contacts.fixtures.ts`**

```typescript
import { CreateContactDto, UpdateContactDto } from '@job-tracker-lite-angular/schemas';

// Define interfaces for test data maps
export interface CreateContactFixturesMap {
  janeDoe: CreateContactDto;
  johnDoe: CreateContactDto;
  allEmpty: CreateContactDto;
  missingName: CreateContactDto;
  missingEmailAndPhone: CreateContactDto;
  invalidEmail: CreateContactDto;
  invalidPhone: CreateContactDto;
}

// Export centralized fixtures with semantic names
export const createContactFixtures: CreateContactFixturesMap = {
  janeDoe: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phoneNumber: '+3612345678',
  },
  invalidEmail: {
    name: 'John Doe',
    email: 'not-an-email',
    phoneNumber: '+3612345678',
  },
  invalidPhone: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '12345',
  },
  // ... more scenarios
};

export interface UpdateContactFixturesMap {
  updatedContact: UpdateContactDto;
  missingName: UpdateContactDto;
  invalidEmail: UpdateContactDto;
  invalidPhone: UpdateContactDto;
  missingEmailAndPhone: UpdateContactDto;
}

export const updateContactFixtures: UpdateContactFixturesMap = {
  updatedContact: {
    name: 'Updated',
    email: 'updated@example.com',
    phoneNumber: '+3699999999',
  },
  missingName: {
    name: '',
    email: 'john.doe@example.com',
    phoneNumber: '+3612345678',
  },
  invalidEmail: {
    name: 'John Doe',
    email: 'not-an-email',
    phoneNumber: '+3612345678',
  },
  // ... more scenarios
};
```

**Key principles:**

- **Semantic naming**: `invalidEmail`, not `testData1`
- **TypeScript interfaces**: Define fixture maps for IDE autocomplete
- **Export centrally**: All fixtures exported from `libs/shared/testing`

---

### Step 2: Use Fixtures in Component Tests

**Import fixtures from centralized library:**

```typescript
import { contactFixtures, createContactFixtures, updateContactFixtures, createContactsDataAccessMock } from '@job-tracker-lite-angular/testing';
```

**Use fixtures in tests:**

```typescript
it('should show validation error if email is invalid', async () => {
  const createContact = vi.fn();
  contactsDataAccessMock.createContact = createContact;

  fixture.detectChanges();

  // ✅ Use fixture instead of hardcoded data
  await harness.fillForm(createContactFixtures.invalidEmail);
  await harness.submit();
  fixture.detectChanges();

  expect(await harness.getEmailErrorText()).toBeTruthy();
  expect(createContact).not.toHaveBeenCalled();
});
```

---

## Fixture Naming Conventions

Use semantic names that describe the **test scenario** being validated:

| Fixture Name           | Purpose                       | When to Use                            |
| ---------------------- | ----------------------------- | -------------------------------------- |
| `janeDoe`, `johnDoe`   | Valid, complete data          | Happy path tests, initialization tests |
| `missingName`          | Name field is empty           | Validation tests for required fields   |
| `invalidEmail`         | Email fails format validation | Email validation tests                 |
| `invalidPhone`         | Phone fails format validation | Phone validation tests                 |
| `missingEmailAndPhone` | Both email and phone empty    | Conditional requirement tests          |
| `allEmpty`             | All fields empty              | Complete form validation tests         |

---

## Fixture Organization

### Directory Structure

```
libs/shared/testing/
├── src/lib/
│   ├── fixtures/
│   │   ├── contacts.fixtures.ts      # Contact-related test data
│   │   ├── jobs.fixtures.ts          # Job-related test data
│   │   ├── notes.fixtures.ts         # Note-related test data
│   │   └── index.ts                  # Export all fixtures
│   ├── mocks/                        # Mock services, data access
│   └── index.ts                      # Main export
```

### Export from `index.ts`

```typescript
// libs/shared/testing/src/index.ts
export * from './lib/fixtures/contacts.fixtures';
export * from './lib/fixtures/jobs.fixtures';
export * from './lib/fixtures/notes.fixtures';
export * from './lib/mocks/contacts-data-access.mock';
```

---

## Benefits of Centralized Fixtures

✅ **Single Source of Truth**

- All test data defined once, used everywhere
- Changes in one place update all tests

✅ **Consistency**

- Same test scenarios produce same results across components
- Team-wide conventions for test data

✅ **Maintainability**

- Fixture updates don't require hunting through multiple test files
- Clear intent: fixture names document what's being tested

✅ **Type Safety**

- TypeScript interfaces for fixture maps provide IDE autocomplete
- Compilation errors if fixture structure changes

✅ **Readability**

- `createContactFixtures.invalidEmail` is self-documenting
- New developers understand test intent immediately

✅ **Reusability**

- Same fixture used in unit tests, e2e tests, storybook stories
- DRY principle across entire test suite

---

## When to Add New Fixtures

Add a new fixture when:

1. You have a **new test scenario** not covered by existing fixtures
2. The scenario represents a **distinct test case** (invalid email ≠ invalid phone)
3. The data combination is **reused across multiple tests**

Example: If three tests all need invalid phone validation, create `invalidPhone` fixture.

---

## Anti-Patterns to Avoid

❌ **Hardcoding in tests:**

```typescript
await harness.fillForm({ name: 'Test', email: 'test@example.com' });
```

❌ **Creating fixtures inline:**

```typescript
const invalidEmailData = { email: 'bad-email' };
await harness.fillForm(invalidEmailData);
```

❌ **Mixing fixture usage:**

```typescript
// Don't mix: use consistently
await harness.fillForm(createContactFixtures.janeDoe); // ✅
await harness.fillForm({ name: 'John', email: 'john@example.com' }); // ❌
```

❌ **Duplicating fixtures:**

```typescript
// contacts.fixtures.ts
export const invalidEmailCreate = { email: 'bad' };
export const invalidEmailUpdate = { email: 'bad' }; // ❌ Duplication
```

---

## Checklist: Before Adding Test Cases

- [ ] Check if fixture already exists in `libs/shared/testing/fixtures/`
- [ ] Import fixture from centralized library, not from test file
- [ ] Use fixture name that describes the test scenario
- [ ] Add fixture to TypeScript interface for IDE support
- [ ] Update `libs/shared/testing/src/index.ts` if creating new fixture file
- [ ] Never hardcode test data in component `.spec.ts` files
- [ ] Verify fixture is reused across multiple tests (if not, consider if it's needed)

---

## Example: Complete Test File Using Fixtures

```typescript
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ContactsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { contactFixtures, createContactFixtures, createContactsDataAccessMock } from '@job-tracker-lite-angular/testing'; // ✅ Import from centralized library
import { CreateContactComponent } from './create-contact.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { CreateContactHarness } from './create-contact.harness';

describe('CreateContactComponent', () => {
  let fixture: ComponentFixture<CreateContactComponent>;
  let harness: CreateContactHarness;
  let contactsDataAccessMock: any;

  beforeEach(async () => {
    contactsDataAccessMock = createContactsDataAccessMock();

    await TestBed.configureTestingModule({
      imports: [CreateContactComponent, getTranslocoModule()],
      providers: [
        {
          provide: ContactsDataAccessService,
          useValue: contactsDataAccessMock,
        },
        {
          provide: DIALOG_DATA,
          useValue: { jobId: 'test-job-id' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateContactComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, CreateContactHarness);
  });

  it('should show validation error if email is invalid', async () => {
    const createContact = vi.fn();
    contactsDataAccessMock.createContact = createContact;

    fixture.detectChanges();

    // ✅ Use fixture instead of hardcoding
    await harness.fillForm(createContactFixtures.invalidEmail);
    await harness.submit();
    fixture.detectChanges();

    expect(await harness.getEmailErrorText()).toBeTruthy();
    expect(createContact).not.toHaveBeenCalled();
  });

  it('should submit and create contact', async () => {
    const createContact = vi.fn().mockResolvedValue(contactFixtures.janeDoe);
    contactsDataAccessMock.createContact = createContact;

    fixture.detectChanges();

    // ✅ Use fixture for valid data
    await harness.fillForm(createContactFixtures.janeDoe);
    await harness.submit();

    expect(createContact).toHaveBeenCalledWith('test-job-id', createContactFixtures.janeDoe);
  });
});
```

---

## References

- **Test Fixtures Location**: `libs/shared/testing/src/lib/fixtures/`
- **Test Library Location**: `libs/shared/testing/`
- **Best Practice**: Always prefer centralized fixtures over hardcoded test data
