import { Component, inject, linkedSignal, signal } from '@angular/core';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { ProfileVisibilitySettingsComponent } from '@job-tracker-lite-angular/frontend-shared';
import { TranslocoModule } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmItemImports } from '@spartan-ng/helm/item';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShieldAlert,
  lucideStar,
  lucideBriefcaseBusiness,
  lucideContact,
  lucideUserRound,
} from '@ng-icons/lucide';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { SaveState } from '@job-tracker-lite-angular/frontend-data-access';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

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
  ],
  providers: [
    provideIcons({
      lucideShieldAlert,
      lucideStar,
      lucideBriefcaseBusiness,
      lucideContact,
      lucideUserRound,
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

  readonly actionButtonLabel = signal<string>('Minden legyen privát');
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
      this.actionButtonLabel.set('Minden legyen privát');
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
      this.actionButtonLabel.set('Minden legyen privát');
      this.restoreMode.set(false);
    } else {
      this.createSnapshot();

      this.personalVisibilityLevel.set($event);
      this.contactVisibilityLevel.set($event);
      this.skillsVisibilityLevel.set($event);
      this.workPreferencesVisibilityLevel.set($event);

      this.actionButtonLabel.set('Visszaállítás');
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
