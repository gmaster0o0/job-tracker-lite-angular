import { z, ZodType } from 'zod';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Converts a Zod schema into an OpenAPI 3.0 schema object, for use in
 * Swagger decorators, e.g. `@ApiBody({ schema: zodToApiSchema(mySchema) })`.
 */
export function zodToApiSchema(schema: ZodType): SchemaObject {
  return z.toJSONSchema(schema, {
    target: 'openapi-3.0',
    unrepresentable: 'any',
  }) as unknown as SchemaObject;
}
