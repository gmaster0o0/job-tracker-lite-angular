import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { hlm } from '@spartan-ng/helm/utils';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { BrnTooltip } from '@spartan-ng/brain/tooltip';
import { provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-progession-stepper',
  imports: [
    CommonModule,
    HlmIconImports,
    HlmTooltipImports,
    BrnTooltip,
    TranslocoModule,
  ],
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

  protected stepClasses(index: number): string {
    return hlm(
      'h-10 w-10 rounded-full border-2 text-xs font-semibold transition-colors disabled:opacity-60',
      this.errorState()
        ? 'border-destructive bg-destructive/10 text-destructive'
        : this.isStepCompleted(index)
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground',
      !this.errorState() && this.isCurrentStep(index) && 'ring-4 ring-ring/30',
    );
  }

  protected labelClasses(index: number): string {
    return hlm(
      'truncate text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60',
      !this.errorState() && this.isStepCompleted(index) && 'text-foreground',
    );
  }

  protected connectorClasses(index: number): string {
    return hlm(
      'absolute left-[calc(50%+24px)] top-5 h-[2px] w-[calc(100%-48px)]',
      this.errorState()
        ? 'bg-destructive/40'
        : this.isConnectorCompleted(index)
          ? 'bg-primary'
          : 'bg-border',
    );
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
