# schemas

Single source of truth library with Zod schemas for validation and type inference. This library is used across different parts of the application to ensure consistent data validation and type safety.


## Building

Run `nx build schemas` to build the library.

## Stucture

- `/src/lib/schemas`: Contains the Zod schemas for validation and type inference.
- `/src/lib/validators`: Contains custom validators that can be used in conjunction with the Zod schemas.
- `/src/lib/error-codes.ts`:Contain all the custom error codes used in the application for validation errors.