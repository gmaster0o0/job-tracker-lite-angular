import { Component, input, model, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';

type InputType = string | null | undefined;

@Component({
  selector: 'app-inline-input',
  standalone: true,
  imports: [FormsModule, NgIconComponent, HlmInputGroupImports],
  templateUrl: './input.component.html',
})
export class InlineInputComponent {
  /**
   * Editing mode state. If true, the input field is displayed; if false, the read-only text is displayed.
   */
  isEditing = input<boolean>(false);
  /**
   * Define the icon to be displayed in the input field. If not provided, no icon will be shown.
   */
  icon = input<string>('');
  /**
   * Define the placeholder text for the input field. If not provided, no placeholder will be shown.
   */
  placeholder = input<string>('');
  /**
   * Define the fallback value to be displayed when the input field is empty. If not provided, no fallback value will be shown.
   */
  fallbackValue = input<InputType>('');
  /**
   * Define whether the input value should be automatically trimmed of whitespace.
   * If true, leading and trailing whitespace will be removed, and multiple spaces will be replaced with a single space.
   * If false, the input value will be used as-is.
   */
  autoTrim = input<boolean>(true);
  /**
   * Fixed prefix shown as a separate addon and hidden from the editable text
   * (e.g. 'https://'). Prepended to typed values that don't already carry a
   * scheme, so the stored value stays a complete URL without making the user
   * type the scheme themselves.
   */
  prefix = input<string>('');
  /**
   * Define the current value of the input field. This value is bound to the input element and will be updated as the user types.
   */
  value = model<InputType>('');
  /**
   * Handle changes to the input value. This method is called whenever the user types in the input field.
   * @param newValue The new value entered by the user.
   */

  displayValue = computed(() =>
    this.stripPrefix(
      this.isEditing() ? (this.value() ?? '') : (this.fallbackValue() ?? ''),
    ),
  );

  onInputChange(newValue: string): void {
    const processedValue = this.autoTrim()
      ? newValue.replace(/\s+/g, ' ').trim()
      : newValue;

    const prefix = this.prefix();
    const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(processedValue);

    this.value.set(
      prefix && processedValue && !hasScheme
        ? prefix + processedValue
        : processedValue,
    );
  }

  private stripPrefix(value: string): string {
    const prefix = this.prefix();
    return prefix && value.startsWith(prefix)
      ? value.slice(prefix.length)
      : value;
  }
}
