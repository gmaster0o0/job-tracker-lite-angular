jest.mock('@nestjs/common', () => ({
  Body: jest.fn((pipe: unknown) => 'bodyDecorator'),
  Param: jest.fn((pipe: unknown) => 'paramDecorator'),
}));

jest.mock('../pipes', () => ({
  ZodValidationPipe: class ZodValidationPipe {
    schema: unknown;
    constructor(schema: unknown) {
      this.schema = schema;
    }
  },
}));

import { z } from 'zod';
import { Body, Param } from '@nestjs/common';

import { ZodBody, ZodParam } from './zod-decorator';
import { ZodValidationPipe } from '../pipes';

describe('Zod decorators', () => {
  beforeEach(() => {
    (Body as unknown as jest.Mock).mockClear();
    (Param as unknown as jest.Mock).mockClear();
  });

  it('ZodBody calls Body with a ZodValidationPipe built from the schema', () => {
    const schema = z.object({ name: z.string() });
    const result = ZodBody(schema);

    expect(Body).toHaveBeenCalledTimes(1);
    const calledArg = (Body as unknown as jest.Mock).mock.calls[0][0];
    expect(calledArg).toBeInstanceOf(ZodValidationPipe);
    expect((calledArg as any).schema).toBe(schema);
    expect(result).toBe('bodyDecorator');
  });

  it('ZodParam calls Param with the param name and a ZodValidationPipe built from the schema', () => {
    const schema = z.object({ id: z.string() });
    const result = ZodParam('id', schema);

    expect(Param).toHaveBeenCalledTimes(1);
    const calledName = (Param as unknown as jest.Mock).mock.calls[0][0];
    const calledArg = (Param as unknown as jest.Mock).mock.calls[0][1];
    expect(calledName).toBe('id');
    expect(calledArg).toBeInstanceOf(ZodValidationPipe);
    expect((calledArg as any).schema).toBe(schema);
    expect(result).toBe('paramDecorator');
  });
});
