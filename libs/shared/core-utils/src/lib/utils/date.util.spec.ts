import {
  addDays,
  addSeconds,
  secondsToDays,
  secondsToHours,
} from './date.util';

describe('addSeconds', () => {
  it('adds the given number of seconds to the provided date', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');

    expect(addSeconds(60, from)).toEqual(new Date('2026-01-01T00:01:00.000Z'));
  });

  it('defaults to the current time when no base date is given', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    try {
      expect(addSeconds(30)).toEqual(new Date('2026-01-01T00:00:30.000Z'));
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('addDays', () => {
  it('adds the given number of days to the provided date', () => {
    const from = new Date('2026-01-01T10:00:00.000Z');

    expect(addDays(from, 7)).toEqual(new Date('2026-01-08T10:00:00.000Z'));
  });

  it('rolls over into the next month/year correctly', () => {
    const from = new Date('2026-12-30T00:00:00.000Z');

    expect(addDays(from, 3)).toEqual(new Date('2027-01-02T00:00:00.000Z'));
  });

  it('does not mutate the given date', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    addDays(from, 5);

    expect(from).toEqual(new Date('2026-01-01T00:00:00.000Z'));
  });
});

describe('secondsToHours', () => {
  it('rounds to the nearest whole hour', () => {
    expect(secondsToHours(60 * 60 * 24)).toBe(24);
    expect(secondsToHours(60 * 60 * 2)).toBe(2);
  });

  it('never returns less than 1', () => {
    expect(secondsToHours(1)).toBe(1);
    expect(secondsToHours(0)).toBe(1);
  });
});

describe('secondsToDays', () => {
  it('rounds to the nearest whole day', () => {
    expect(secondsToDays(60 * 60 * 24 * 7)).toBe(7);
  });

  it('never returns less than 1', () => {
    expect(secondsToDays(1)).toBe(1);
    expect(secondsToDays(0)).toBe(1);
  });
});
