export function addSeconds(seconds: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + seconds * 1000);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function secondsToHours(seconds: number): number {
  return Math.max(1, Math.round(seconds / (60 * 60)));
}

export function secondsToDays(seconds: number): number {
  return Math.max(1, Math.round(seconds / (60 * 60 * 24)));
}
