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
  isEditing = input<boolean>(false);
  icon = input<string>('');
  placeholder = input<string>('');
  fallbackValue = input<InputType>('');

  autoTrim = input<boolean>(true);

  // 2 way data model
  value = model<InputType>('');

  onInputChange(newValue: string): void {
    const processedValue = this.autoTrim()
      ? newValue.replace(/\s+/g, ' ').trim()
      : newValue;

    this.value.set(processedValue);
  }
}
