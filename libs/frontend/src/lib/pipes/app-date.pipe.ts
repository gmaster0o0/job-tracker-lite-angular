import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserPreferencesService } from '../services/user-preferences.service';

@Pipe({
  name: 'appDate',
  standalone: true,
  pure: false,
})
export class AppDatePipe implements PipeTransform {
  private preferences = inject(UserPreferencesService);
  private datePipe = new DatePipe('en-US');

  transform(value: string): string | null {
    const fmt = this.normalizeFormat(this.preferences.dateFormat());
    return this.datePipe.transform(value, fmt);
  }

  private normalizeFormat(fmt?: string | null): string | undefined {
    if (fmt === null || fmt === undefined) return undefined;

    return fmt
      .replace(/Y+/g, (m) => 'y'.repeat(m.length))
      .replace(/D+/g, (m) => 'd'.repeat(m.length));
  }
}
