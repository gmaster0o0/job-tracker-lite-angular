export function formatShortDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(
  target: Date,
  now: Date,
  locale: string,
): string {
  const diffMs = target.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffHours) >= 24) {
    return rtf.format(Math.round(diffHours / 24), 'day');
  }
  return rtf.format(Math.round(diffHours), 'hour');
}
