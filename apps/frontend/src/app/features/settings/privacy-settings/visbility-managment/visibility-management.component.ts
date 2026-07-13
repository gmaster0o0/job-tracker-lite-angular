import {
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { ProfileVisibilitySettingsComponent } from '@job-tracker-lite-angular/frontend-shared';
import { translateSignal, TranslocoModule } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmItemImports } from '@spartan-ng/helm/item';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShieldAlert,
  lucideStar,
  lucideBriefcaseBusiness,
  lucideContact,
  lucideUserRound,
  lucideCheck,
  lucideAlertCircle,
} from '@ng-icons/lucide';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { SaveState } from '@job-tracker-lite-angular/frontend-data-access';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
//import { marker } from '@jsverse/transloco-keys-manager';

const marker = (key: string) => key;

@Component({
  selector: 'app-visibility-management',
  standalone: true,
  imports: [
    HlmTypographyImports,
    ProfileVisibilitySettingsComponent,
    TranslocoModule,
    HlmButtonImports,
    HlmItemImports,
    NgIcon,
    HlmSpinner,
    HlmBadgeImports,
  ],
  providers: [
    provideIcons({
      lucideShieldAlert,
      lucideStar,
      lucideBriefcaseBusiness,
      lucideContact,
      lucideUserRound,
      lucideCheck,
      lucideAlertCircle,
    }),
  ],
  templateUrl: './visibility-management.component.html',
})
export class VisibilityManagementComponent {
  private readonly profileDataAccessService = inject(ProfileDataAccessService);
  profileResource = this.profileDataAccessService.profileResource;

  saveState = signal<SaveState>('idle');

  // Signals for each visibility level
  readonly personalVisibilityLevel = linkedSignal(
    () => this.profileResource.value()?.personalVisibility ?? 0,
  );
  readonly contactVisibilityLevel = linkedSignal(
    () => this.profileResource.value()?.contactVisibility ?? 0,
  );
  readonly skillsVisibilityLevel = linkedSignal(
    () => this.profileResource.value()?.skillsVisibility ?? 0,
  );
  readonly workPreferencesVisibilityLevel = linkedSignal(
    () => this.profileResource.value()?.preferenceVisibility ?? 0,
  );

  private actionButtonToken = signal<string>(
    marker('privacySettings.visibilityManagement.makeAllPrivate'),
  );
  readonly actionButtonLabel = translateSignal(
    computed(() => this.actionButtonToken()),
  );
  readonly restoreMode = signal<boolean>(false);
  private visibilitySnapshot: { [key: string]: number } | null = null;

  onVisibilityChange(
    type: 'all' | 'personal' | 'contact' | 'skills' | 'workPreferences',
    $event: number,
  ) {
    switch (type) {
      case 'personal':
        this.personalVisibilityLevel.set($event);
        break;
      case 'contact':
        this.contactVisibilityLevel.set($event);
        break;
      case 'skills':
        this.skillsVisibilityLevel.set($event);
        break;
      case 'workPreferences':
        this.workPreferencesVisibilityLevel.set($event);
        break;
      case 'all':
        this.handleSnapshot($event);
        break;
    }
    if (type !== 'all') {
      this.actionButtonToken.set(
        marker('privacySettings.visibilityManagement.makeAllPrivate'),
      );
    }

    this.debounceAndSave();
  }

  private createSnapshot() {
    this.visibilitySnapshot = {
      personal: this.personalVisibilityLevel(),
      contact: this.contactVisibilityLevel(),
      skills: this.skillsVisibilityLevel(),
      workPreferences: this.workPreferencesVisibilityLevel(),
    };
  }

  private restoreSnapshot() {
    if (this.visibilitySnapshot) {
      this.personalVisibilityLevel.set(this.visibilitySnapshot['personal']);
      this.contactVisibilityLevel.set(this.visibilitySnapshot['contact']);
      this.skillsVisibilityLevel.set(this.visibilitySnapshot['skills']);
      this.workPreferencesVisibilityLevel.set(
        this.visibilitySnapshot['workPreferences'],
      );
    }

    this.visibilitySnapshot = null;
  }

  private handleSnapshot($event: number) {
    if (this.restoreMode()) {
      this.restoreSnapshot();
      this.actionButtonToken.set(
        marker('privacySettings.visibilityManagement.makeAllPrivate'),
      );
      this.restoreMode.set(false);
    } else {
      this.createSnapshot();

      this.personalVisibilityLevel.set($event);
      this.contactVisibilityLevel.set($event);
      this.skillsVisibilityLevel.set($event);
      this.workPreferencesVisibilityLevel.set($event);

      this.actionButtonToken.set(
        marker('privacySettings.visibilityManagement.restore'),
      );
      this.restoreMode.set(true);
    }
  }
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

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
      await this.profileDataAccessService.updateProfile({
        contactVisibility: this.contactVisibilityLevel(),
        personalVisibility: this.personalVisibilityLevel(),
        skillsVisibility: this.skillsVisibilityLevel(),
        preferenceVisibility: this.workPreferencesVisibilityLevel(),
      });
      this.saveState.set('saved');

      setTimeout(() => {
        this.saveState.set('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to save preferences', error);
      this.saveState.set('error');

      setTimeout(() => {
        this.saveState.set('idle');
      }, 2000);
    }
  }
}
