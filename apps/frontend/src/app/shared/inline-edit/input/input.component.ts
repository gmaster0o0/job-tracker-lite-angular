import { Component, input, model } from '@angular/core';
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
   * Define the current value of the input field. This value is bound to the input element and will be updated as the user types.
   */
  value = model<InputType>('');
  /**
   * Handle changes to the input value. This method is called whenever the user types in the input field.
   * @param newValue The new value entered by the user.
   */
  onInputChange(newValue: string): void {
    const processedValue = this.autoTrim()
      ? newValue.replace(/\s+/g, ' ').trim()
      : newValue;

    this.value.set(processedValue);
  }
}
