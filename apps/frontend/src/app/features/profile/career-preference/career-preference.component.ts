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
import {
  formImports,
  interactiveImports,
  layoutImports,
} from '../profile.hlmimports';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { ProfileVisibilitySettingsComponent } from '../visibility-settings/visibility-settings.component';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

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

  // Signals for each field
  experienceLevel = linkedSignal(() => this.profile().experienceLevel ?? null);
  workingStyle = linkedSignal(() => this.profile().workingStyle ?? null);
  careerType = linkedSignal(() => this.profile().careerType ?? null);

  preferenceVisibility = linkedSignal(
    () => this.profile().preferenceVisibility ?? null,
  );

  onVisibilityChange(value: any) {
    this.preferenceVisibility.set(value);
    this.markActive();
    this.debounceAndSave();
  }

  // SaveState
  saveState = signal<SaveState>('idle');
  saveStateChanged = output<SaveState>();

  // Visibility gadget megjelenítése: azonnal előjön bármilyen interakcióra,
  // és csak akkor kezd el eltűnni, ha egy ideig nem történik újabb interakció
  // (idle/saved állapotban), hiszterézissel, hogy ne pattogjon.
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
        preferenceVisibility: this.preferenceVisibility(),
      });
      this.saveState.set('saved');
      this.saveStateChanged.emit('saved');

      // Reset to idle after 2s, and only now start the countdown to hide
      // the visibility gadget (a sikeres mentés lezárja az "aktív" ciklust)
      setTimeout(() => {
        this.saveState.set('idle');
        this.saveStateChanged.emit('idle');
        this.scheduleHide();
      }, 2000);
    } catch (error) {
      console.error('Failed to save preferences', error);
      this.saveState.set('error');
      this.saveStateChanged.emit('error');

      // Hiba esetén szándékosan NEM hívjuk a scheduleHide()-ot: amíg
      // hibaállapotban vagyunk, a widget marad látható, hogy a user lássa,
      // mit állított be, és tudjon újra próbálkozni.
      setTimeout(() => {
        this.saveState.set('idle');
        this.saveStateChanged.emit('idle');
      }, 2000);
    }
  }
}
