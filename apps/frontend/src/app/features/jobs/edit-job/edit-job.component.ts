import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { JobDto } from '@job-tracker-lite-angular/api-interfaces';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';

type EditJobDialogContext = {
  job: JobDto;
};

@Component({
  standalone: true,
  selector: 'app-edit-job',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButtonImports,
    HlmInputImports,
  ],
  template: `
    <div
      class="flex flex-col gap-4 p-6 bg-background border rounded-lg shadow-lg"
    >
      <h2 class="text-lg font-semibold tracking-tight">Edit Job</h2>
      <p class="text-sm text-muted-foreground">
        Update the details for the job at {{ job.company }}.
      </p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div class="space-y-1">
          <label hlmLabel for="company">Company</label>
          <input
            hlmInput
            id="company"
            formControlName="company"
            placeholder="e.g. Acme Inc"
            class="w-full"
          />
        </div>

        <div class="space-y-1">
          <label hlmLabel for="position">Position</label>
          <input
            hlmInput
            id="position"
            formControlName="position"
            placeholder="e.g. Frontend Engineer"
            class="w-full"
          />
        </div>

        <div class="space-y-1">
          <label hlmLabel for="link">Job Link</label>
          <input
            hlmInput
            id="link"
            formControlName="link"
            placeholder="https://..."
            class="w-full"
          />
        </div>

        <div class="space-y-1">
          <label hlmLabel for="description">Description</label>
          <textarea
            hlmInput
            id="description"
            formControlName="description"
            placeholder="A brief overview of the role"
            class="w-full"
            rows="3"
          ></textarea>
        </div>

        @if (submitError()) {
          <div class="text-sm font-medium text-destructive">
            {{ submitError() }}
          </div>
        }

        <div class="flex justify-end gap-2 pt-2">
          <button hlmBtn type="button" variant="outline" (click)="cancel()">
            Cancel
          </button>
          <button
            hlmBtn
            type="submit"
            [disabled]="form.invalid || isSubmitting()"
          >
            {{ isSubmitting() ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class EditJobComponent {
  private readonly fb = inject(FormBuilder);
  private readonly jobsDataAccess = inject(JobsDataAccessService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly dialogContext = injectBrnDialogContext<EditJobDialogContext>(
    { optional: true },
  );

  protected readonly job = this.dialogContext?.job as JobDto;
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    company: [this.job?.company || '', Validators.required],
    position: [this.job?.position || '', Validators.required],
    link: [this.job?.link || '', Validators.required],
    description: [this.job?.description || '', Validators.required],
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting() || !this.job) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    this.isSubmitting.set(true);

    const value = this.form.getRawValue();

    try {
      const updated = await this.jobsDataAccess.updateJob(this.job.id, {
        company: value.company.trim(),
        link: value.link.trim(),
        description: value.description.trim(),
        position: value.position.trim(),
      });

      this.dialogRef?.close(updated);
    } catch {
      this.submitError.set('Failed to update job. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected cancel(): void {
    this.dialogRef?.close();
  }
}
