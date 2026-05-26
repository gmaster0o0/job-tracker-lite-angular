import z from 'zod';

/**
 * Standardized error codes for validation errors.
 */
export const errorCodes = {
  need_number: 'need_number',
  need_letter: 'need_letter',
  need_special: 'need_special',
  required: 'required',
  required_one_of: 'required_one_of',
};
