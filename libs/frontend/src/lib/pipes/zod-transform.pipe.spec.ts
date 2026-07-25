import { describe, expect, it } from 'vitest';
import type { ValidationError, WithFieldTree } from '@angular/forms/signals';
import {
  ZodTransformPipeFirst,
  ZodTransformPipeAll,
} from './zod-transform.pipe';
import {
  zodIssueInvalidEmail,
  zodIssueWeakPassword,
  zodIssuePasswordTooShort,
} from '@job-tracker-lite-angular/testing';

describe('ZodTransformPipeFirst', () => {
  it('should transform the first Zod error item into a token', () => {
    const pipe = new ZodTransformPipeFirst();
    const errors = [
      { issue: zodIssueInvalidEmail },
      { issue: zodIssueWeakPassword },
    ] as unknown as WithFieldTree<ValidationError>[];

    const result = pipe.transform(errors, 'login');

    expect(result).toEqual({
      key: 'login.email.invalid_type',
      params: {
        params: {
          errorCode: 'invalid_email',
        },
      },
    });
  });

  it('should return null when there are no errors', () => {
    const pipe = new ZodTransformPipeFirst();

    expect(pipe.transform([], 'login')).toBeNull();
    expect(pipe.transform(null, 'login')).toBeNull();
    expect(pipe.transform(undefined, 'login')).toBeNull();
  });
});

describe('ZodTransformPipeAll', () => {
  it('should transform all Zod error items into tokens', () => {
    const pipe = new ZodTransformPipeAll();
    const errors = [
      { issue: zodIssueInvalidEmail },
      { issue: zodIssueWeakPassword },
      { issue: zodIssuePasswordTooShort },
    ] as unknown as WithFieldTree<ValidationError>[];

    const result = pipe.transform(errors, 'register');

    expect(result).toEqual([
      {
        key: 'register.email.invalid_type',
        params: {
          params: {
            errorCode: 'invalid_email',
          },
        },
      },
      {
        key: 'register.password.invalid_type',
        params: {
          params: {
            errorCode: 'weak_password',
          },
        },
      },
      {
        key: 'register.password.too_small',
        params: {
          params: {
            errorCode: 'too_short',
            min: 8,
          },
        },
      },
    ]);
  });

  it('should return null when there are no errors', () => {
    const pipe = new ZodTransformPipeAll();

    expect(pipe.transform([], 'register')).toBeNull();
    expect(pipe.transform(null, 'register')).toBeNull();
    expect(pipe.transform(undefined, 'register')).toBeNull();
  });
});
