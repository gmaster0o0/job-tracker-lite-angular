import { Body } from '@nestjs/common';
import { ZodValidationPipe } from '../pipes';
import { ZodType } from 'zod';

export const ZodBody = (schema: ZodType) => Body(new ZodValidationPipe(schema));
