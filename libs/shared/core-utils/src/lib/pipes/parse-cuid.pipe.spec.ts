import { BadRequestException } from '@nestjs/common';
import { ParseCuidPipe } from './parse-cuid.pipe';

describe('ParseCuidPipe', () => {
  let pipe: ParseCuidPipe;

  beforeEach(() => {
    pipe = new ParseCuidPipe();
  });

  it('It should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('Happy path', () => {
    it('should accept a valid classic CUID', () => {
      const validCuid = 'ch72gsb320000ud31737faw0x';
      expect(pipe.transform(validCuid)).toBe(validCuid);
    });

    it('should accept a valid Cuid2 identifier', () => {
      const validCuid2 = 'tz4a98xxat96iws9zmbrgj3a';
      expect(pipe.transform(validCuid2)).toBe(validCuid2);
    });
  });

  describe('Error path', () => {
    it('should throw an error if the string is too short', () => {
      const shortId = 'abc123';
      expect(() => pipe.transform(shortId)).toThrow(BadRequestException);
    });

    it('should throw an error if it contains special characters', () => {
      const invalidId = 'ch72gsb320000ud31737faw0!';
      expect(() => pipe.transform(invalidId)).toThrow(BadRequestException);
    });

    it('should throw an error for an empty string', () => {
      expect(() => pipe.transform('')).toThrow(BadRequestException);
    });

    it('should contain the correct error message', () => {
      try {
        pipe.transform('invalid-id');
      } catch (e: any) {
        expect(e.response.message).toContain('Invalid identifier:');
      }
    });
  });
});
