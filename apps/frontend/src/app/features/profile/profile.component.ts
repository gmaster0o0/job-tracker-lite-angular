import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { provideIcons } from '@ng-icons/core';
import { profileIcons, hlmImports } from './profile.hlmimports';
import { EditButtonComponent } from '../../shared/edit-button/edit-button.component';
import { SaveButtonComponent } from '../../shared/save-button/save-button.component';
import { CancelButtonComponent } from '../../shared/cancel-button/cancel-button.component';
import {
  CareerPreferenceComponent,
  SaveState,
} from './career-preference/career-preference.component';
import { TranslocoModule } from '@jsverse/transloco';

import {
  UserProfileDto,
  UpdateUserProfileDto,
} from '@job-tracker-lite-angular/schemas';
import { InlineInputComponent } from '../../shared/inline-edit/input/input.component';
import { InlineTextareaComponent } from '../../shared/inline-edit/textarea/textarea.component';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [
    CommonModule,
    EditButtonComponent,
    SaveButtonComponent,
    CancelButtonComponent,
    CareerPreferenceComponent,
    TranslocoModule,
    hlmImports,
    InlineInputComponent,
    InlineTextareaComponent,
  ],
  providers: [provideIcons(profileIcons)],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private readonly profileData = inject(ProfileDataAccessService);

  profileResource = this.profileData.profileResource;

  editingSection = signal<string | null>(null);
  savingSection = signal<string | null>(null);
  isCareerPreferenceSaving = signal(false);
  editData: Partial<UserProfileDto> = {};

  onCareerPreferenceSaveStateChange(state: SaveState) {
    this.isCareerPreferenceSaving.set(state === 'saving');
  }

  isSectionVisible(
    profile: UserProfileDto,
    sectionVisibility:
      | 'personalVisibility'
      | 'contactVisibility'
      | 'skillsVisibility'
      | 'preferenceVisibility',
  ) {
    return profile.isPublic && profile[sectionVisibility];
  }

  editSection(section: string, profile: UserProfileDto) {
    this.editingSection.set(section);
    this.editData = {
      ...profile,
      coreSkills: [...profile.coreSkills],
    };
  }

  cancelEdit() {
    this.editingSection.set(null);
    this.editData = {};
  }

  async saveSection(section: string) {
    let updateDto: UpdateUserProfileDto = {};

    if (section === 'personal') {
      updateDto = {
        name: this.editData.name,
        title: this.editData.title,
        city: this.editData.city,
        bio: this.editData.bio,
        isPublic: this.editData.isPublic,
        personalVisibility: this.editData.personalVisibility,
      };
    } else if (section === 'contact') {
      updateDto = {
        email: this.editData.email,
        linkedin: this.editData.linkedin,
        github: this.editData.github,
        webpage: this.editData.webpage,
        contactVisibility: this.editData.contactVisibility,
      };
    } else if (section === 'skills') {
      updateDto = {
        coreSkills: this.editData.coreSkills,
        skillsVisibility: this.editData.skillsVisibility,
      };
    }

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

  removeSkill(index: number) {
    if (this.editData.coreSkills) {
      this.editData.coreSkills.splice(index, 1);
    }
  }

  addSkill(skill: string) {
    const trimmedSkill = skill.trim();
    if (
      trimmedSkill &&
      this.editData.coreSkills &&
      !this.editData.coreSkills.includes(trimmedSkill)
    ) {
      this.editData.coreSkills.push(trimmedSkill);
    }
  }
}
