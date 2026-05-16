export interface TranslocoToken {
  key: string; // ex. "login.email.invalid_format"
  params: Record<string, any>; // ex. { format: "email", pattern: "..." }
}
/**
 * Converts a single Zod issue into a TranslocoToken that can be used for i18n error messages.
 * @param issue Zod issue
 * @param formNamespace Contextual namespace for the form (e.g., "login", "registration")
 * to build the translation key.
 * @returns Transforms the Zod issue into a TranslocoToken with a structured key
 * and relevant parameters for translation.
 */
export function transformZodIssue(
  issue: any,
  formNamespace: string,
): TranslocoToken {
  const pathKey = issue.path?.join('.') || 'global';
  const finalErrorCode = issue.errorCode || issue.code || 'unknown_error';

  const key = `${formNamespace}.${pathKey}.${finalErrorCode}`;

  // Filter out the standard Zod issue properties and keep only the relevant ones for
  // translation parameters
  const ignoredKeys = ['code', 'path', 'message', 'origin', 'errorCode'];
  const restParams = Object.keys(issue).reduce(
    (acc, currentKey) => {
      if (!ignoredKeys.includes(currentKey)) {
        acc[currentKey] = (issue as any)[currentKey];
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  return {
    key,
    params: restParams,
  };
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
  issues: any[],
  formNamespace: string,
): TranslocoToken[] {
  if (!issues || !Array.isArray(issues)) return [];

  return issues.map((err) => {
    const actualIssue = err.issue || err;
    return transformZodIssue(actualIssue, formNamespace);
  });
}
