import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { NotificationService } from '@job-tracker-lite-angular/frontend-data-access';

/**
 * This is a temporary test component to check app few features.
 * Dont add any translation here, this is not a real component and will be removed in the future.
 */
@Component({
  standalone: true,
  selector: 'app-about',
  imports: [CommonModule, HlmButtonImports, HlmTypographyImports],
  template: `
    <div class="mx-auto max-w-3xl space-y-6 p-6">
      <div class="space-y-2">
        <h1 hlmH1>{{ title }}</h1>
        <p hlmLead>{{ description }}</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <button hlmBtn type="button" class="w-full" (click)="onSuccess()">
          {{ successButton }}
        </button>
        <button hlmBtn type="button" class="w-full" (click)="onError()">
          {{ errorButton }}
        </button>
        <button hlmBtn type="button" class="w-full" (click)="onInfo()">
          {{ infoButton }}
        </button>
        <button hlmBtn type="button" class="w-full" (click)="onWarning()">
          {{ warningButton }}
        </button>
        <button hlmBtn type="button" class="w-full" (click)="onShow()">
          {{ showButton }}
        </button>
        <button hlmBtn type="button" class="w-full" (click)="onPromise()">
          {{ promiseButton }}
        </button>
      </div>

      <div hlmMuted>
        {{ hint }}
      </div>
    </div>
  `,
})
export class AboutComponent {
  private readonly notification = inject(NotificationService);

  protected readonly title = 'Toast tester';
  protected readonly description =
    'Use the buttons below to trigger every toast variant.';
  protected readonly successButton = 'Show success toast';
  protected readonly errorButton = 'Show error toast';
  protected readonly infoButton = 'Show info toast';
  protected readonly warningButton = 'Show warning toast';
  protected readonly showButton = 'Show default toast';
  protected readonly promiseButton = 'Show promise toast';
  protected readonly hint = 'The promise toast resolves after 2 seconds.';

  protected onSuccess(): void {
    this.notification.success('Success', 'This is a success toast.');
  }

  protected onError(): void {
    this.notification.error('Error', 'This is an error toast.');
  }

  protected onInfo(): void {
    this.notification.info('Info', 'This is an info toast.');
  }

  protected onWarning(): void {
    this.notification.warning('Warning', 'This is a warning toast.');
  }

  protected onShow(): void {
    this.notification.show('Default', 'This is a standard toast.');
  }

  protected onPromise(): void {
    const promise = new Promise<void>((resolve) => setTimeout(resolve, 2000));
    this.notification.promise(promise, {
      loading: 'Promise is loading...',
      success: 'Promise completed',
      error: 'Promise failed',
    });
  }
}
