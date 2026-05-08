import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uptime',
  standalone: true,
  pure: true,
})
export class UptimePipe implements PipeTransform {
  transform(value?: string | number | null): string {
    if (value === undefined || value === null || value === '') return '—';
    const secs = Number(value);
    if (!Number.isFinite(secs) || isNaN(secs)) return '—';

    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);

    const parts: string[] = [];
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
  }
}
