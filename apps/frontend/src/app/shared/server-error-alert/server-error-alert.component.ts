import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideAlertCircle } from '@ng-icons/lucide';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-server-error-alert',
  imports: [CommonModule, HlmAlertImports, HlmIconImports, TranslocoModule],
  providers: [provideIcons({ lucideAlertCircle })],
  templateUrl: './server-error-alert.component.html',
})
export class ServerErrorAlertComponent {
  /**
   * Status signal - should return 'error' when there's an error
   */
  readonly status = input.required<() => string>();

  /**
   * Backend response signal containing errorCode
   */
  readonly backendResponse = input.required<
    () => {
      errorCode?: string;
    } | null
  >();

  /**
   * Translation key prefix (e.g., 'jobs.create', 'jobs.update', 'contacts.create')
   */
  readonly translationPrefix = input.required<string>();

  /**
   * CSS class for customization (optional)
   */
  readonly cssClass = input<string>('max-w-md');

  /**
   * Unwrapped status value for template use
   */
  protected readonly statusValue = computed(() => this.status()());

  /**
   * Computed error code for safe template access
   */
  protected readonly errorCode = computed(() => {
    const response = this.backendResponse()();
    return response?.errorCode || 'message';
  });
}
