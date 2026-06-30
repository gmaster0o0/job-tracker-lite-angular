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
  isEditing = input<boolean>(false);
  icon = input<string>('');
  placeholder = input<string>('');
  fallbackValue = input<TextareaType>('');

  autoTrim = input<boolean>(true);

  // 2 way data model
  value = model<TextareaType>('');

  onInputChange(newValue: string): void {
    const processedValue = this.autoTrim() ? newValue.trim() : newValue;

    this.value.set(processedValue);
  }
}
