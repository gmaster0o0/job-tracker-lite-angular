import { parseEnvValue } from './config.util';

describe('parseEnvValue', () => {
  const FALLBACK = 10;

  it('should return the parsed number when it is a positive finite number', () => {
    expect(parseEnvValue('20', FALLBACK)).toBe(20);
    expect(parseEnvValue(30, FALLBACK)).toBe(30);
  });

  it('should parse the multiple types correctly', () => {
    expect(parseEnvValue('20 * 20', FALLBACK)).toBe(400);
    expect(parseEnvValue('10*10', FALLBACK)).toBe(100);
    expect(parseEnvValue('-2 * 5', FALLBACK)).toBe(-10);
  });

  it('should return the floored value when given a decimal positive number', () => {
    expect(parseEnvValue('20.5', FALLBACK)).toBe(20);
    expect(parseEnvValue(30.9, FALLBACK)).toBe(30);
  });

  it('should return fallback when value is undefined', () => {
    expect(parseEnvValue(undefined, FALLBACK)).toBe(FALLBACK);
  });

  it('should return fallback when value is not a finite number', () => {
    expect(parseEnvValue('invalid', FALLBACK)).toBe(FALLBACK);
    expect(parseEnvValue(Infinity, FALLBACK)).toBe(FALLBACK);
    expect(parseEnvValue(-Infinity, FALLBACK)).toBe(FALLBACK);
  });

  it('should return the value when it is zero or negative', () => {
    expect(parseEnvValue('0', FALLBACK)).toBe(0);
    expect(parseEnvValue('-5', FALLBACK)).toBe(-5);
    expect(parseEnvValue(0, FALLBACK)).toBe(0);
    expect(parseEnvValue(-10, FALLBACK)).toBe(-10);
  });

  it('should return fallback when value is NaN', () => {
    expect(parseEnvValue(NaN, FALLBACK)).toBe(FALLBACK);
  });
});
