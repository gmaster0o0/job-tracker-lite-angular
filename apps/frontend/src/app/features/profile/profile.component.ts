import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { provideIcons } from '@ng-icons/core';
import { profileIcons } from './profile.hlmimports';
import {
  CareerPreferenceComponent,
  SaveState,
} from './career-preference/career-preference.component';
import { TranslocoModule } from '@jsverse/transloco';
import { SkillManagerComponent } from './skill-manager/skill-manager.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { ContactInfoComponent } from './contact-info/contact-info.component';

import {
  UserProfileDto,
  UpdateUserProfileDto,
} from '@job-tracker-lite-angular/schemas';

type SectionName = 'personal' | 'contact' | 'skills';

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
  private readonly profileData = inject(ProfileDataAccessService);

  profileResource = this.profileData.profileResource;

  editingSection = signal<SectionName | null>(null);
  savingSection = signal<SectionName | null>(null);
  editData = signal<Partial<UserProfileDto>>({});

  isCareerPreferenceSaving = signal(false);
  isSkillManagerSaving = signal(false);

  // egyszerre csak egy szekció szerkeszthető
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
      await this.profileData.updateProfile(updateDto);
      this.editingSection.set(null);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      this.savingSection.set(null);
    }
  }
}
