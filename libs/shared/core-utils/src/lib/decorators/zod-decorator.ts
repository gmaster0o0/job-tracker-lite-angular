import { Body, Param } from '@nestjs/common';
import { ZodValidationPipe } from '../pipes';
import { ZodType } from 'zod';

/**
 * Custom decorator to validate request body using Zod schema
 * @param schema
 * @returns
 */
export const ZodBody = (schema: ZodType) => Body(new ZodValidationPipe(schema));
/**
 * Custom decorator to validate request parameters using Zod schema
 * @param paramName - The name of the parameter to validate
 * @param schema
 * @returns
 */
export const ZodParam = (paramName: string, schema: ZodType) =>
  Param(paramName, new ZodValidationPipe(schema));
