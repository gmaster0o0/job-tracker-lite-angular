import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';

type TextareaType = string | null | undefined;

@Component({
  selector: 'app-inline-textarea',
  standalone: true,
  imports: [FormsModule, NgIconComponent, HlmTextareaImports],
  templateUrl: './textarea.component.html',
})
export class InlineTextareaComponent {
  /**
   * Editing mode state. If true, the textarea field is displayed; if false, the read-only text is displayed.
   */
  isEditing = input<boolean>(false);
  /**
   * Define the icon to be displayed in the textarea field. If not provided, no icon will be shown.
   */
  icon = input<string>('');
  /**
   * Define the placeholder text for the textarea field. If not provided, no placeholder will be shown.
   */
  placeholder = input<string>('');
  /**
   * Define the fallback value to be displayed when the textarea field is empty. If not provided, no fallback value will be shown.
   */
  fallbackValue = input<TextareaType>('');
  /**
   * Define whether the textarea value should be automatically trimmed of whitespace.
   * If true, leading and trailing whitespace will be removed, and multiple spaces will be replaced with a single space.
   * If false, the textarea value will be used as-is.
   */
  autoTrim = input<boolean>(true);
  /**
   * Define the current value of the textarea. This value is bound to the textarea element and will be updated as the user types.
   */
  value = model<TextareaType>('');
  /**
   * Handle changes to the textarea value. This method is called whenever the user types in the textarea.
   * @param newValue The new value entered by the user.
   */
  onInputChange(newValue: string): void {
    const processedValue = this.autoTrim() ? newValue.trim() : newValue;

    this.value.set(processedValue);
  }
}
