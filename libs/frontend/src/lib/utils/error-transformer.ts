import { z } from 'zod';

export interface TranslocoToken {
  key: string; // ex. "login.email.invalid_format"
  params: Record<string, unknown>; // ex. { format: "email", pattern: "..." }
}

/**
 * The Standard Schema spec (implemented by Angular Signal Forms
 * `validateStandardSchema` and by Zod itself) allows path elements to be
 * either plain PropertyKeys or an object with { key: PropertyKey }.
 * In practice Zod always returns a plain PropertyKey, but the type must
 * follow the specification.
 */
type PathSegment = PropertyKey | { key: PropertyKey };

function normalizePathSegment(segment: PathSegment): PropertyKey {
  return typeof segment === 'object' ? segment.key : segment;
}

/**
 * A "loose" issue shape for non-Zod-origin errors (for example, a backend
 * error response that has no `.issue`).
 */
export interface LooseIssue {
  code?: string;
  errorCode?: string;
  path?: PathSegment[];
  message?: string;
}

/**
 * The minimal guaranteed contract for real Zod issues is defined by Zod's own
 * $ZodIssueBase interface (code optional, path/message required), plus our
 * own errorCode field — OR a loose, validated non-Zod error.
 */
export type IssueLike =
  | (z.core.$ZodIssueBase & { errorCode?: string })
  | LooseIssue;

/**
 * Converts a single Zod issue into a TranslocoToken that can be used for i18n error messages.
 * @param issue Zod issue
 * @param formNamespace Contextual namespace for the form (e.g., "login", "registration")
 * to build the translation key.
 * @returns Transforms the Zod issue into a TranslocoToken with a structured key
 * and relevant parameters for translation.
 */
export function transformZodIssue(
  issue: IssueLike,
  formNamespace: string,
): TranslocoToken {
  const path = issue.path ?? [];
  const pathKey =
    path.length > 0 ? path.map(normalizePathSegment).join('.') : 'global';
  const finalErrorCode = issue.errorCode ?? issue.code ?? 'unknown_error';

  const key = `${formNamespace}.${pathKey}.${finalErrorCode}`;
  // Filter out the standard Zod issue properties and keep only the relevant ones for
  // translation parameters
  const ignoredKeys = new Set<string>([
    'code',
    'path',
    'message',
    'origin',
    'errorCode',
  ]);

  const restParams = Object.entries(issue).reduce<Record<string, unknown>>(
    (acc, [currentKey, value]) => {
      if (!ignoredKeys.has(currentKey)) {
        acc[currentKey] = value;
      }
      return acc;
    },
    {},
  );

  return { key, params: restParams };
}

/**
 * Transforms an array of Zod issues into an array of TranslocoTokens for i18n error handling.
 * @param issues
 * @param formNamespace Contextual namespace for the form (e.g., "login", "registration") to
 * build the translation key
 * @returns array of TranslocoTokens derived from the Zod issues, each containing a
 * structured key and relevant parameters for translation.
 */
export function transformZodIssues(
  issues: IssueLike[],
  formNamespace: string,
): TranslocoToken[] {
  if (!issues || !Array.isArray(issues)) return [];

  return issues.map((issue) => transformZodIssue(issue, formNamespace));
}
