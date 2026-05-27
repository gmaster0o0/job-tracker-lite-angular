import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({ name: z.string() });
  let pipe: ZodValidationPipe;

  beforeEach(() => {
    pipe = new ZodValidationPipe(schema);
  });

  it('returns parsed data when input is valid', () => {
    const input = { name: 'Alice' };
    const result = pipe.transform(input);
    expect(result).toEqual(input);
  });

  it('throws BadRequestException when input is invalid', () => {
    const input = { name: 123 } as unknown;
    expect(() => pipe.transform(input)).toThrow(BadRequestException);
  });
});
