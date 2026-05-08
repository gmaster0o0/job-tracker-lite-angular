import { UptimePipe } from './uptime.pipe';
import { describe, it, expect, beforeEach } from 'vitest';

describe('UptimePipe', () => {
  let pipe: UptimePipe;

  beforeEach(() => {
    pipe = new UptimePipe();
  });

  it('formats seconds into h m s', () => {
    expect(pipe.transform(3661)).toBe('1h 1m 1s');
    expect(pipe.transform('3661')).toBe('1h 1m 1s');
    expect(pipe.transform(65)).toBe('1m 5s');
    expect(pipe.transform(59)).toBe('59s');
    expect(pipe.transform(0)).toBe('0s');
  });

  it('handles falsy and invalid values', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform('')).toBe('—');
    expect(pipe.transform('not-a-number')).toBe('—');
  });
});
