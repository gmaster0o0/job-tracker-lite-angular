import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
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
  templateUrl: './edit-job.component.html',
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
