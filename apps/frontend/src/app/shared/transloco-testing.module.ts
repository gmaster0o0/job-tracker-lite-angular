import { TranslocoTestingOptions } from '@jsverse/transloco';
import { createTranslocoTestingModule } from '@job-tracker-lite-angular/frontend-data-access';
import en from '../../../public/assets/i18n/en.json';
import hu from '../../../public/assets/i18n/hu.json';

export function getTranslocoModule(options: TranslocoTestingOptions = {}) {
  return createTranslocoTestingModule({ en, hu }, options);
}
