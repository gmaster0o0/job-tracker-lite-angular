import {
  Component,
  debounced,
  effect,
  inject,
  signal,
  input,
  linkedSignal,
  output,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideAlertCircle, lucideLoader } from '@ng-icons/lucide';
import { TranslocoModule } from '@jsverse/transloco';
import {
  UserProfileDto,
  ExperienceLevel,
  WorkingStyle,
  CareerPreferenceType,
} from '@job-tracker-lite-angular/schemas';
import {
  formImports,
  interactiveImports,
  layoutImports,
} from '../profile.hlmimports';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { ProfileVisibilitySettingsComponent } from '@job-tracker-lite-angular/frontend-shared';
import { SaveState } from '@job-tracker-lite-angular/frontend-data-access';

const SAVE_DEBOUNCE_MS = 1000;

@Component({
  standalone: true,
  selector: 'app-career-preference',
  imports: [
    CommonModule,
    FormsModule,
    TranslocoModule,
    formImports,
    interactiveImports,
    layoutImports,
    HlmSpinner,
    ProfileVisibilitySettingsComponent,
  ],
  providers: [
    provideIcons({
      lucideCheck,
      lucideAlertCircle,
      lucideLoader,
    }),
  ],
  templateUrl: './career-preference.component.html',
})
export class CareerPreferenceComponent {
  private readonly profileData = inject(ProfileDataAccessService);

  profile = input.required<UserProfileDto>();
  disabled = input<boolean>(false);

  experienceLevel = linkedSignal(() => this.profile().experienceLevel ?? null);
  workingStyle = linkedSignal(() => this.profile().workingStyle ?? null);
  careerType = linkedSignal(() => this.profile().careerType ?? null);

  preferenceVisibility = linkedSignal(
    () => this.profile().preferenceVisibility ?? null,
  );

  onVisibilityChange(value: number) {
    this.preferenceVisibility.set(value);
    this.markActive();
    this.debounceAndSave();
  }

  saveState = signal<SaveState>('idle');
  saveStateChanged = output<SaveState>();

  // Visibility gadget display: appears immediately on any interaction,
  // and only starts to disappear after a while if no new interaction occurs
  // (in idle/saved state), with hysteresis to prevent flickering.
  showVisibilityGadget = signal(false);
  private readonly hideDelayMs = 4000;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  private markActive() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.showVisibilityGadget.set(true);
  }

  private scheduleHide() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    this.hideTimer = setTimeout(() => {
      this.showVisibilityGadget.set(false);
    }, this.hideDelayMs);
  }

  experienceLevels: ExperienceLevel[] = [
    'INTERN',
    'JUNIOR',
    'MID',
    'SENIOR',
    'LEAD',
    'EXPERT',
  ];
  workingStyles: WorkingStyle[] = ['REMOTE', 'HYBRID', 'ON_SITE'];
  careerTypes: CareerPreferenceType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT'];

  // Debouncing a request count rather than the field values keeps saves
  // user-initiated: the linked signals also change when the profile input does.
  private readonly saveRequests = signal(0);
  private readonly settledSaveRequests = debounced(
    this.saveRequests,
    SAVE_DEBOUNCE_MS,
  );

  constructor() {
    effect(() => {
      if (this.settledSaveRequests.value() === 0) {
        return;
      }
      untracked(() => void this.save());
    });
  }

  onExperienceLevelChange(value: ExperienceLevel | null | undefined) {
    this.experienceLevel.set(value ?? null);
    this.markActive();
    this.debounceAndSave();
  }

  onWorkingStyleChange(value: WorkingStyle | null | undefined) {
    this.workingStyle.set(value ?? null);
    this.markActive();
    this.debounceAndSave();
  }

  onCareerTypeChange(value: CareerPreferenceType | null | undefined) {
    this.careerType.set(value ?? null);
    this.markActive();
    this.debounceAndSave();
  }

  private debounceAndSave() {
    this.saveRequests.update((count) => count + 1);
  }

  private async save() {
    this.saveState.set('saving');
    this.saveStateChanged.emit('saving');
    try {
      await this.profileData.updateProfile({
        experienceLevel: this.experienceLevel(),
        workingStyle: this.workingStyle(),
        careerType: this.careerType(),
        preferenceVisibility: this.preferenceVisibility(),
      });
      this.saveState.set('saved');
      this.saveStateChanged.emit('saved');

      // Reset to idle after 2s, and only now start the countdown to hide
      // the visibility gadget (a successful save ends the "active" cycle)
      setTimeout(() => {
        this.saveState.set('idle');
        this.saveStateChanged.emit('idle');
        this.scheduleHide();
      }, 2000);
    } catch (error) {
      console.error('Failed to save preferences', error);
      this.saveState.set('error');
      this.saveStateChanged.emit('error');

      setTimeout(() => {
        this.saveState.set('idle');
        this.saveStateChanged.emit('idle');
      }, 2000);
    }
  }
}
