import {
  Component,
  inject,
  signal,
  input,
  linkedSignal,
  output,
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
import { hlmImports } from '../profile.hlmimports';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  standalone: true,
  selector: 'app-career-preference',
  imports: [CommonModule, FormsModule, TranslocoModule, hlmImports, HlmSpinner],
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

  // Signals for each field
  experienceLevel = linkedSignal(() => this.profile().experienceLevel ?? null);
  workingStyle = linkedSignal(() => this.profile().workingStyle ?? null);
  careerType = linkedSignal(() => this.profile().careerType ?? null);

  // SaveState
  saveState = signal<SaveState>('idle');
  saveStateChanged = output<SaveState>();

  // Enums
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

  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Effect to reset saveState to 'idle' when profile changes
  }

  onExperienceLevelChange(value: ExperienceLevel | null | undefined) {
    this.experienceLevel.set(value ?? null);
    this.debounceAndSave();
  }

  onWorkingStyleChange(value: WorkingStyle | null | undefined) {
    this.workingStyle.set(value ?? null);
    this.debounceAndSave();
  }

  onCareerTypeChange(value: CareerPreferenceType | null | undefined) {
    this.careerType.set(value ?? null);
    this.debounceAndSave();
  }

  private debounceAndSave() {
    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Set new timeout for 1s
    this.saveTimeout = setTimeout(() => {
      void this.save();
    }, 1000);
  }

  private async save() {
    this.saveState.set('saving');
    this.saveStateChanged.emit('saving');
    try {
      await this.profileData.updateProfile({
        experienceLevel: this.experienceLevel(),
        workingStyle: this.workingStyle(),
        careerType: this.careerType(),
      });
      this.saveState.set('saved');
      this.saveStateChanged.emit('saved');

      // Reset to idle after 2s
      setTimeout(() => {
        this.saveState.set('idle');
        this.saveStateChanged.emit('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to save preferences', error);
      this.saveState.set('error');
      this.saveStateChanged.emit('error');

      // Reset to idle after 2s
      setTimeout(() => {
        this.saveState.set('idle');
        this.saveStateChanged.emit('idle');
      }, 2000);
    }
  }
}
