import { Directive, inject } from '@angular/core';
import { NgControl, ValidationErrors } from '@angular/forms';

/**
 * Patches the InteropNgControl.errors getter so that BrnField receives errors keyed
 * by Zod errorCode/code instead of the "standardSchema" kind. This makes
 * `validator="required"` (and all other error keys) work on hlm-field-error natively
 * when using @angular/forms/signals with validateStandardSchema — no changes to
 * hlm-field-error or any other spartan-ng component required.
 *
 * Apply by adding this directive to your component's imports array. It auto-activates
 * on every `<input [formField]="...">` and `<textarea [formField]="...">` in that template.
 *
 * @example
 * // component.ts
 * imports: [ZodNgControlBridgeDirective]
 *
 * // component.html
 * <input hlmInput [formField]="form.position" />
 * <hlm-field-error validator="required">Position is required</hlm-field-error>
 */
@Directive({
  selector: 'input[formField],textarea[formField]',
  standalone: true,
})
export class ZodNgControlBridgeDirective {
  constructor() {
    const ngControl = inject(NgControl, { optional: true }) as {
      field?: () => {
        errors(): Array<{
          issue?: { errorCode?: string; code?: string };
          kind?: string;
        }>;
      };
      errors: ValidationErrors | null;
    } | null;

    // Only patch when this is a signal-forms InteropNgControl (has .field signal)
    if (!ngControl?.field) return;

    Object.defineProperty(ngControl, 'errors', {
      get(): ValidationErrors | null {
        // ngControl.field is the FieldState signal — reading it here inside a
        // computed() (SignalStateTracker.errors) keeps reactive tracking intact.
        const errors = ngControl!.field!().errors();
        if (!errors.length) return null;
        const result: ValidationErrors = {};
        for (const error of errors) {
          const issue = error?.issue;
          const key = issue?.errorCode ?? issue?.code ?? error?.kind;
          if (key) result[key] = true;
        }
        return Object.keys(result).length > 0 ? result : null;
      },
      configurable: true,
    });
  }
}
