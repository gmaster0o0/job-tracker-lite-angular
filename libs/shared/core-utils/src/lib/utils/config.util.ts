export function parseEnvValue(
  value: string | number | undefined,
  fallback: number,
): number {
  if (typeof value === 'string' && value.includes('*')) {
    const parts = value.split('*').map((p) => Number(p.trim()));
    if (parts.every((p) => !isNaN(p))) {
      const multiplication = parts.reduce((acc, curr) => acc * curr, 1);
      return Number.isFinite(multiplication)
        ? Math.floor(multiplication)
        : fallback;
    }
  }

  const parsed = Number(value ?? fallback);

  return Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
}
