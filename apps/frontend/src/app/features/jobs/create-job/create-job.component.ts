import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { JobDto } from '@job-tracker-lite-angular/api-interfaces';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';

type CreateJobDialogContext = {
  onCreated?: (job: JobDto) => void;
};

@Component({
  standalone: true,
  selector: 'app-create-job',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButtonImports,
    HlmInputImports,
  ],
  templateUrl: './create-job.component.html',
})
export class CreateJobComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dataAccess = inject(DataAccessService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly dialogContext =
    injectBrnDialogContext<CreateJobDialogContext>({ optional: true });

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    jobTitle: ['', Validators.required],
    position: ['', Validators.required],
    company: ['', Validators.required],
    link: ['', Validators.required],
    description: ['', Validators.required],
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    this.isSubmitting.set(true);

    const value = this.form.getRawValue();

    try {
      const created = await this.dataAccess.createJob({
        company: value.company.trim(),
        link: value.link.trim(),
        description: value.description.trim(),
        position: value.position.trim() || value.jobTitle.trim(),
      });

      this.dialogContext?.onCreated?.(created);
      this.dialogRef?.close(created);
    } catch {
      this.submitError.set('Failed to create job. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected cancel(): void {
    this.dialogRef?.close();
  }
}
