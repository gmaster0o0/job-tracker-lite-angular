import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideTrash } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import {
  FormField,
  FormRoot,
  form,
  validateStandardSchema,
} from '@angular/forms/signals';
import { ReactiveFormsModule } from '@angular/forms';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import {
  isBackendError,
  ZodTransformPipFirst,
} from '@job-tracker-lite-angular/frontend-data-access';
import { CancelButtonComponent } from '@job-tracker-lite-angular/frontend-shared';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';

/**
 * The `validateStandardSchema` second parameter's type is derived here,
 * so we don't have to directly reference the standard-schema package.
 * Any standard-schema compatible schema (e.g., Zod) can be passed.
 */
type ConfirmationFieldSchema = Parameters<typeof validateStandardSchema>[1];

/**
 * The optional "type the confirmation" field configuration.
 *
 * IMPORTANT: the component only runs the provided schema on the entered value
 * (i.e., it only "matches") — what the entered value should match is determined
 * by the caller when constructing the schema. Fetching the necessary data is
 * NOT the responsibility of this component.
 */
export type ConfirmationDialogFieldConfig = {
  /** The initial value of the field. */
  initialValue: string;
  /** The standard schema implementing the validation/matching logic. */
  validationSchema?: ConfirmationFieldSchema;
  /** Already resolved (translated) label text. */
  label?: string;
  /** Already resolved placeholder text. */
  placeholder?: string;
  /** Already resolved hint text, which only appears if there is no valid error message on the field. */
  hint?: string;
  /** Namespace-prefix, which is used to complete the schema error keys
   *  passed to the `zodTransformFirst` pipe (e.g., 'settings.deleteJobs'). */
  errorTranslationPrefix?: string;
};

export type ConfirmationDialogContext = {
  onConfirm?: (value: string) => void | Promise<void>;
  /** Already resolved texts — the caller is responsible for translating
   *  them (e.g., `translateSignal(...)()`), the dialog only displays them. */
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busyLabel?: string;
  isBusy?: boolean;
  /**
   * If not provided, the dialog behaves as a simple confirm/cancel dialog
   * without a field and validation.
   */
  field?: ConfirmationDialogFieldConfig;
};

@Component({
  standalone: true,
  selector: 'app-confirmation-dialog',
  imports: [
    HlmAlertDialogImports,
    HlmButton,
    CancelButtonComponent,
    HlmIconImports,
    ReactiveFormsModule,
    HlmInputImports,
    HlmFieldImports,
    FormRoot,
    FormField,
    TranslocoModule,
    ZodTransformPipFirst,
  ],
  providers: [provideIcons({ lucideTrash })],
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private readonly context =
    injectBrnDialogContext<ConfirmationDialogContext>({
      optional: true,
    }) ?? {};

  readonly isBusy = input<boolean>(false);
  readonly confirm = output<string>();

  /**
   * The dialog's own default texts.Can be overridden by the context's texts, which are already translated.
   */
  private readonly defaultTitle = translateSignal(
    'shared.confirmationDialog.title',
  );
  private readonly defaultDescription = translateSignal(
    'shared.confirmationDialog.description',
  );
  private readonly defaultConfirmLabel = translateSignal(
    'shared.confirmationDialog.confirm',
  );
  private readonly defaultCancelLabel = translateSignal(
    'shared.confirmationDialog.cancel',
  );
  private readonly defaultBusyLabel = translateSignal(
    'shared.confirmationDialog.busy',
  );
  private readonly defaultFieldLabel = translateSignal(
    'shared.confirmationDialog.fieldLabel',
  );
  private readonly defaultFieldPlaceholder = translateSignal(
    'shared.confirmationDialog.fieldPlaceholder',
  );
  /**
   * The dialog's effective texts, which are either the context's texts (already translated) or the dialog's own default texts.
   */
  protected readonly texts = computed(() => ({
    title: this.context.title ?? this.defaultTitle(),
    description: this.context.description ?? this.defaultDescription(),
    confirmLabel: this.context.confirmLabel ?? this.defaultConfirmLabel(),
    cancelLabel: this.context.cancelLabel ?? this.defaultCancelLabel(),
    busyLabel: this.context.busyLabel ?? this.defaultBusyLabel(),
    fieldLabel: this.context.field?.label ?? this.defaultFieldLabel(),
    fieldPlaceholder:
      this.context.field?.placeholder ?? this.defaultFieldPlaceholder(),
    fieldHint: this.context.field?.hint,
  }));

  /**
   * Null, if no field is configured -> basic confirm/cancel dialog.
   */
  protected readonly fieldConfig = this.context.field ?? null;
  /**
   * The prefix helps to translate the error codes
   */
  protected readonly errorTranslationPrefix =
    this.fieldConfig?.errorTranslationPrefix ?? '';
  /**
   * The effective "is busy" state, which is either the context's isBusy or the dialog's own isBusy.
   * The dialog's own isBusy is set to true when the form is submitting.
   * The context's isBusy can be used to disable the dialog from the outside.
   */
  protected readonly effectiveIsBusy = signal(this.context.isBusy ?? false);
  protected readonly submitError = signal<string | null>(null);

  /**
   * The model for the confirmation value.
   */
  protected readonly model = signal<{ confirmationValue: string }>({
    confirmationValue: this.fieldConfig?.initialValue ?? '',
  });

  /**
   * A form always exists, but only gets a validator if there is
   * a fieldConfig — without it, it is always considered valid, so the submit
   * button behaves as a simple "confirm" button.
   */
  protected readonly confirmationForm = form(
    this.model,
    (path) => {
      const schema = this.fieldConfig?.validationSchema;
      if (schema) {
        validateStandardSchema(path, schema);
      }
    },
    {
      submission: {
        action: async (data) => {
          this.effectiveIsBusy.set(true);
          this.submitError.set(null);
          try {
            const value = data().value().confirmationValue as string;
            if (this.context.onConfirm) {
              await this.context.onConfirm(value);
            }
            this.confirm.emit(value);
            this.dialogRef?.close();
          } catch (error) {
            this.submitError.set(
              isBackendError(error) ? error.errorCode : 'unknown',
            );
          } finally {
            this.effectiveIsBusy.set(false);
          }
        },
      },
    },
  );

  constructor() {
    effect(() => {
      /**
       * When user types in the field, we clear the submitError, so that the user can try again.
       */
      this.confirmationForm.confirmationValue().value();
      untracked(() => this.submitError.set(null));
    });
  }
  protected onCancel(): void {
    this.dialogRef?.close();
  }
}
