import { isHttpError } from './http.utils';

describe('isHttpError', () => {
  it('returns true for objects with a numeric status property', () => {
    expect(isHttpError({ status: 404 })).toBe(true);
  });

  it('returns false for objects without a status property', () => {
    expect(isHttpError({})).toBe(false);
  });

  it('returns false for objects with a non-numeric status', () => {
    expect(isHttpError({ status: '404' })).toBe(false);
  });

  it('returns false for null or undefined values', () => {
    expect(isHttpError(null)).toBe(false);
    expect(isHttpError(undefined)).toBe(false);
  });
});
