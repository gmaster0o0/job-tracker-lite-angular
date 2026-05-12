export function isHttpError(error: unknown): error is { status?: number } {
  return !!error && typeof (error as { status?: number }).status === 'number';
}
