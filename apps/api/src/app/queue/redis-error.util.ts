// ioredis connection failures often surface as an AggregateError whose own
// `.message` is empty (the useful detail - e.g. "ECONNREFUSED" - lives on
// `.code`), so a plain `error.message` log line ends up blank.
export function describeRedisError(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const code = (error as NodeJS.ErrnoException).code;
  if (error.message && code) {
    return `${error.message} (${code})`;
  }

  return error.message || code || error.name;
}
