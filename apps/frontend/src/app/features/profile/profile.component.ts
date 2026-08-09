import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { provideIcons } from '@ng-icons/core';
import { profileIcons } from './profile.hlmimports';
import { CareerPreferenceComponent } from './career-preference/career-preference.component';
import { SaveState } from '@job-tracker-lite-angular/frontend-data-access';
import { TranslocoModule } from '@jsverse/transloco';
import { SkillManagerComponent } from './skill-manager/skill-manager.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { ContactInfoComponent } from './contact-info/contact-info.component';
import { httpResource } from '@angular/common/http';

import {
  UserProfileDto,
  UpdateUserProfileDto,
} from '@job-tracker-lite-angular/schemas';

type SectionName = 'personal' | 'contact' | 'skills' | 'career-preference';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [
    CommonModule,
    PersonalInfoComponent,
    ContactInfoComponent,
    CareerPreferenceComponent,
    SkillManagerComponent,
    TranslocoModule,
  ],
  providers: [provideIcons(profileIcons)],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private readonly profileDataAccess = inject(ProfileDataAccessService);

  mode = input<'own' | 'mod'>('own');
  targetUserId = input<string | null>(null);

  // Resource for mod profile - automatically refetches when targetUserId changes
  private readonly modProfileResource = httpResource<UserProfileDto>(() => {
    const userId = this.targetUserId();
    return userId && this.mode() === 'mod'
      ? `/api/users/${userId}/profile`
      : undefined;
  });

  // Use the appropriate profile based on mode
  protected readonly profile = computed(() => {
    if (this.mode() === 'mod') {
      return this.modProfileResource.value();
    }
    return this.profileDataAccess.profileResource.value();
  });

  protected readonly profileResource = computed(() => {
    if (this.mode() === 'mod') {
      return {
        value: this.modProfileResource.value,
        isLoading: this.modProfileResource.isLoading,
      };
    }
    return {
      value: this.profileDataAccess.profileResource.value,
      isLoading: this.profileDataAccess.profileResource.isLoading,
    };
  });

  editingSection = signal<SectionName | null>(null);
  savingSection = signal<SectionName | null>(null);
  editData = signal<Partial<UserProfileDto>>({});

  isCareerPreferenceSaving = signal(false);
  isSkillManagerSaving = signal(false);

  // Computed properties to determine if any section is being edited or
  // if specific sections should be disabled based on the current state of editing and saving.
  isAnySectionEditing = computed(() => this.editingSection() !== null);

  isPersonalDisabled = computed(
    () =>
      this.editingSection() === 'contact' ||
      this.isAnySectionEditing() ||
      this.isCareerPreferenceSaving() ||
      this.isSkillManagerSaving(),
  );
  isContactDisabled = computed(
    () =>
      this.editingSection() === 'personal' ||
      this.isAnySectionEditing() ||
      this.isCareerPreferenceSaving() ||
      this.isSkillManagerSaving(),
  );

  onCareerPreferenceSaveStateChange(state: SaveState) {
    this.isCareerPreferenceSaving.set(state === 'saving');
  }

  onSkillManagerSaveStateChange(state: 'idle' | 'saving' | 'saved' | 'error') {
    this.isSkillManagerSaving.set(state === 'saving');
  }

  editSection(section: SectionName, profile: UserProfileDto) {
    this.editingSection.set(section);
    this.editData.set({
      ...profile,
      coreSkills: [...profile.coreSkills],
    });
  }

  cancelEdit() {
    this.editingSection.set(null);
    this.editData.set({});
  }

  async saveSection(section: SectionName, updateDto: UpdateUserProfileDto) {
    try {
      this.savingSection.set(section);
      const currentMode = this.mode();
      const userId = this.targetUserId();

      if (currentMode === 'mod' && userId) {
        const updated = await this.profileDataAccess.updateUserProfile(
          userId,
          updateDto,
        );
        this.modProfileResource.update(() => updated);
      } else {
        // User editing their own profile
        await this.profileDataAccess.updateProfile(updateDto);
      }

      this.editingSection.set(null);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      this.savingSection.set(null);
    }
  }
}
