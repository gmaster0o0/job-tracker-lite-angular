import { Component, computed, input, model } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideEye, lucideMinus, lucidePlus } from '@ng-icons/lucide';
import { interactiveImports } from '../profile.hlmimports';
import { TranslocoModule, translateSignal } from '@jsverse/transloco';

export enum VisibilityLevel {
  PRIVATE = 0, // Only the profile owner can see it (Locked)
  RECRUITER = 10, // Only verified recruiters and the owner
  REGISTERED = 20, // Logged-in platform members, recruiters, and the owner
  PUBLIC = 30, // Anyone on the web (Fully open)
}

@Component({
  selector: 'app-profile-visibility-settings',
  standalone: true,
  imports: [interactiveImports, TranslocoModule],
  providers: [provideIcons({ lucideEye, lucideMinus, lucidePlus })],
  templateUrl: './visibility-settings.component.html',
})
export class ProfileVisibilitySettingsComponent {
  readonly minVisibilityLevel = 0;
  readonly maxVisibilityLevel = 30;
  readonly visibilityStep = 10;

  readonly visibilityLevel = model<number>(0);
  readonly visibilityHint = input<string>('');
  readonly tooltipPosition = input<'top' | 'bottom' | 'left' | 'right'>(
    'bottom',
  );
  readonly tooltipDisabled = input<boolean>(false);

  // If false, the widget only displays the compact row (icon + current
  // visibility level), hiding the hint text and the slider (+/- buttons, bars).
  // This allows the parent component to "collapse" the widget when it's not
  // needed (e.g., no active editing).
  readonly interactive = input<boolean>(true);

  // Computed property to determine the visibility level key for translation based on the current visibility level
  //this solution only for keyextratror
  protected readonly publicLabel = translateSignal(
    'profile.visibilitySettings.public',
  );
  protected readonly registeredLabel = translateSignal(
    'profile.visibilitySettings.registered',
  );
  protected readonly recruiterLabel = translateSignal(
    'profile.visibilitySettings.recruiter',
  );
  protected readonly privateLabel = translateSignal(
    'profile.visibilitySettings.private',
  );

  readonly visibilityLevelText = computed(() => {
    const level = this.visibilityLevel();

    if (level >= VisibilityLevel.PUBLIC) {
      return this.publicLabel();
    }
    if (level >= VisibilityLevel.REGISTERED) {
      return this.registeredLabel();
    }
    if (level >= VisibilityLevel.RECRUITER) {
      return this.recruiterLabel();
    }

    return this.privateLabel();
  });

  protected readonly publicToolTip = translateSignal(
    'profile.visibilitySettings.tooltip.public',
  );
  protected readonly registeredToolTip = translateSignal(
    'profile.visibilitySettings.tooltip.registered',
  );
  protected readonly recruiterToolTip = translateSignal(
    'profile.visibilitySettings.tooltip.recruiter',
  );
  protected readonly privateToolTip = translateSignal(
    'profile.visibilitySettings.tooltip.private',
  );

  getTooltipText(step: number): string {
    switch (step) {
      case VisibilityLevel.PUBLIC:
        return this.publicLabel();
      case VisibilityLevel.REGISTERED:
        return this.registeredLabel();
      case VisibilityLevel.RECRUITER:
        return this.recruiterLabel();
      default:
        return this.privateLabel();
    }
  }

  decreaseVisibility(): void {
    this.visibilityLevel.update((level) =>
      Math.max(this.minVisibilityLevel, level - this.visibilityStep),
    );
  }

  increaseVisibility(): void {
    this.visibilityLevel.update((level) =>
      Math.min(this.maxVisibilityLevel, level + this.visibilityStep),
    );
  }
}
