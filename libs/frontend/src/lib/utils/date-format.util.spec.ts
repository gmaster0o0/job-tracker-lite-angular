import { describe, it, expect } from 'vitest';
import { formatShortDateTime, formatRelativeTime } from './date-format.util';

describe('formatShortDateTime', () => {
  it('should format a date using the given locale', () => {
    const date = new Date('2026-01-15T09:30:00.000Z');
    expect(formatShortDateTime(date, 'en-US')).toMatch(
      /^Jan 15, \d{2}:\d{2} [AP]M$/,
    );
  });

  it('should format a date using a different locale', () => {
    const date = new Date('2026-01-15T09:30:00.000Z');
    expect(formatShortDateTime(date, 'hu-HU')).toMatch(
      /^jan\. 15\. \d{1,2}:\d{2}$/,
    );
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-01-15T09:00:00.000Z');

  it('should format a target under 24 hours away in hours', () => {
    const target = new Date('2026-01-15T12:00:00.000Z');
    expect(formatRelativeTime(target, now, 'en-US')).toBe('in 3 hours');
  });

  it('should format a target 24 hours or more away in days', () => {
    const target = new Date('2026-01-17T09:00:00.000Z');
    expect(formatRelativeTime(target, now, 'en-US')).toBe('in 2 days');
  });

  it('should format a past target', () => {
    const target = new Date('2026-01-15T07:00:00.000Z');
    expect(formatRelativeTime(target, now, 'en-US')).toBe('2 hours ago');
  });
});
