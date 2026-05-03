import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { JobDto } from '@job-tracker-lite-angular/api-interfaces';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { CreateJobDialogFooterComponent } from '../../../shared/create-job-dialog-footer/create-job-dialog-footer.component';

type CreateJobDialogContext = {
  onCreated?: (job: JobDto) => void;
};

@Component({
  standalone: true,
  selector: 'app-create-job',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInputImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputGroupImports,
    HlmTextarea,
    HlmDialogImports,
    CreateJobDialogFooterComponent,
  ],
  templateUrl: './create-job.component.html',
})
export class CreateJobComponent {
  private readonly fb = inject(FormBuilder);
  private readonly jobsDataAccess = inject(JobsDataAccessService);
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly dialogContext =
    injectBrnDialogContext<CreateJobDialogContext>({ optional: true });

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
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
      const created = await this.jobsDataAccess.createJob({
        company: value.company.trim(),
        link: value.link.trim(),
        description: value.description.trim(),
        position: value.position.trim(),
      });

      this.dialogContext?.onCreated?.(created);
      this.dialogRef?.close(created);
    } catch {
      this.submitError.set('Failed to create job. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
