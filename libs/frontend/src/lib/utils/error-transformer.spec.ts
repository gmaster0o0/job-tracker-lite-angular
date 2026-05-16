import { describe, expect, it } from 'vitest';
import {
  transformZodIssue,
  transformZodIssues,
} from '../utils/error-transformer';
import {
  buildZodIssue,
  zodIssueInvalidEmail,
  zodIssueWeakPassword,
} from '@job-tracker-lite-angular/testing';

describe('transformZodIssue', () => {
  it('should convert a single Zod issue into a TranslocoToken', () => {
    const issue = buildZodIssue({
      path: ['email'],
      code: 'invalid_type',
      message: 'Invalid email',
      errorCode: 'invalid_email',
      extra: 'value',
    });

    const result = transformZodIssue(issue, 'login');

    expect(result).toEqual({
      key: 'login.email.invalid_email',
      params: {
        params: {
          errorCode: 'invalid_email',
        },
        extra: 'value',
      },
    });
  });

  it('should use a global key when no path is provided', () => {
    const issue = buildZodIssue({ path: undefined, code: 'custom_error' });

    const result = transformZodIssue(issue as any, 'register');

    expect(result.key).toBe('register.global.custom_error');
  });
});

describe('transformZodIssues', () => {
  it('should convert an array of Zod issues into TranslocoTokens', () => {
    const issues = [zodIssueInvalidEmail, zodIssueWeakPassword];

    const result = transformZodIssues(issues, 'login');

    expect(result).toEqual([
      {
        key: 'login.email.invalid_type',
        params: {
          params: {
            errorCode: 'invalid_email',
          },
        },
      },
      {
        key: 'login.password.invalid_type',
        params: {
          params: {
            errorCode: 'weak_password',
          },
        },
      },
    ]);
  });

  it('should return an empty array when the input is not a valid issue list', () => {
    expect(transformZodIssues(null as any, 'login')).toEqual([]);
    expect(transformZodIssues(undefined as any, 'login')).toEqual([]);
    expect(transformZodIssues('not-an-array' as any, 'login')).toEqual([]);
  });
});
