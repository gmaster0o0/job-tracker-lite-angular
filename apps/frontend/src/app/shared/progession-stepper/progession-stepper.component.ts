import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { BrnTooltip } from '@spartan-ng/brain/tooltip';
import { provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';

@Component({
  standalone: true,
  selector: 'app-progession-stepper',
  imports: [CommonModule, HlmIconImports, HlmTooltipImports, BrnTooltip],
  providers: [provideIcons({ lucideCheck })],
  templateUrl: './progession-stepper.component.html',
})
export class ProgessionStepperComponent {
  readonly labels = input.required<readonly string[]>();
  readonly activeIndex = input.required<number>();
  readonly errorState = input(false);
  readonly disabled = input(false);

  readonly stepSelected = output<number>();

  protected isStepCompleted(index: number): boolean {
    if (this.errorState()) {
      return false;
    }

    return index <= this.activeIndex();
  }

  protected isCurrentStep(index: number): boolean {
    return index === this.activeIndex();
  }

  protected isConnectorCompleted(index: number): boolean {
    if (this.errorState()) {
      return false;
    }

    return index < this.activeIndex();
  }

  protected selectStep(index: number): void {
    if (this.disabled() || index === this.activeIndex()) {
      return;
    }

    this.stepSelected.emit(index);
  }
}
