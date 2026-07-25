import { Pipe, PipeTransform } from '@angular/core';
import type { ValidationError, WithFieldTree } from '@angular/forms/signals';
import {
  transformZodIssue,
  transformZodIssues,
  type IssueLike,
} from '../utils/error-transformer';

/**
 * Signal Forms `errors()` returns mixed error types: Zod-origin errors
 * (`kind: 'standardSchema'`, with `.issue`) AND native Signal Forms errors
 * as well (e.g. `required`, `minlength` — these do NOT have `.issue`).
 *
 * - For Zod errors: if `.issue` exists, forward it (code, path, etc.)
 *   regardless of `kind`.
 * - For native errors: there is no Zod issue, so we use `kind`
 *   (e.g. 'required') as errorCode so there is something to translate and
 *   the error does not silently pass through.
 */
function toIssueLike(error: WithFieldTree<ValidationError>): IssueLike {
  if ('issue' in error && error.issue) {
    return error.issue as IssueLike;
  }

  return {
    errorCode: error.kind,
    message: error.message,
    path: [],
  };
}

/**
 * Angular pipe to transform Signal Forms validation errors into a format
 * suitable for i18n translation.
 */
@Pipe({
  name: 'zodTransformFirst',
  standalone: true,
})
export class ZodTransformPipeFirst implements PipeTransform {
  transform(
    errors: WithFieldTree<ValidationError>[] | null | undefined,
    namespace: string,
  ) {
    if (!errors || errors.length === 0) return null;

    return transformZodIssue(toIssueLike(errors[0]), namespace);
  }
}

/**
 * Angular pipe to transform all Signal Forms validation errors into a
 * format suitable for i18n translation.
 */
@Pipe({
  name: 'zodTransformAll',
  standalone: true,
})
export class ZodTransformPipeAll implements PipeTransform {
  transform(
    errors: WithFieldTree<ValidationError>[] | null | undefined,
    namespace: string,
  ) {
    if (!errors || errors.length === 0) return null;

    const issues = errors.map(toIssueLike);
    return transformZodIssues(issues, namespace);
  }
}
