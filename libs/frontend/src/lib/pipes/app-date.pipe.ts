import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SettingsService } from '../services/settings.service';

@Pipe({
  name: 'appDate',
  standalone: true,
  pure: false,
})
export class AppDatePipe implements PipeTransform {
  private settings = inject(SettingsService);
  private datePipe = new DatePipe('en-US');

  transform(value: string): string | null {
    const fmt = this.normalizeFormat(this.settings.dateFormat);
    return this.datePipe.transform(value, fmt);
  }

  private normalizeFormat(fmt?: string | null): string | undefined {
    if (fmt === null || fmt === undefined) return undefined;

    return fmt
      .replace(/Y+/g, (m) => 'y'.repeat(m.length))
      .replace(/D+/g, (m) => 'd'.repeat(m.length));
  }
}
