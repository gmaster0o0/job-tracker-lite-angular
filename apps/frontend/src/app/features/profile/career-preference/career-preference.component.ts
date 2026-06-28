import { Component, inject, signal, input, effect } from '@angular/core';
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

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  standalone: true,
  selector: 'app-career-preference',
  imports: [CommonModule, FormsModule, TranslocoModule, hlmImports],
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

  // Signals for each field
  experienceLevel = signal<ExperienceLevel | null>(null);
  workingStyle = signal<WorkingStyle | null>(null);
  careerType = signal<CareerPreferenceType | null>(null);

  // SaveState
  saveState = signal<SaveState>('idle');

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
    // Initialize signals from profile
    effect(
      () => {
        const prof = this.profile();
        this.experienceLevel.set(prof.experienceLevel ?? null);
        this.workingStyle.set(prof.workingStyle ?? null);
        this.careerType.set(prof.careerType ?? null);
      },
      { allowSignalWrites: true },
    );
  }

  onExperienceLevelChange(value: ExperienceLevel | null) {
    this.experienceLevel.set(value);
    this.debounceAndSave();
  }

  onWorkingStyleChange(value: WorkingStyle | null) {
    this.workingStyle.set(value);
    this.debounceAndSave();
  }

  onCareerTypeChange(value: CareerPreferenceType | null) {
    this.careerType.set(value);
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
    try {
      await this.profileData.updateProfile({
        experienceLevel: this.experienceLevel(),
        workingStyle: this.workingStyle(),
        careerType: this.careerType(),
      });
      this.saveState.set('saved');

      // Reset to idle after 2s
      setTimeout(() => {
        this.saveState.set('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to save preferences', error);
      this.saveState.set('error');

      // Reset to idle after 2s
      setTimeout(() => {
        this.saveState.set('idle');
      }, 2000);
    }
  }
}
