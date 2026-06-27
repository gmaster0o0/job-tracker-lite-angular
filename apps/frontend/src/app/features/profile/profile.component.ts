import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { provideIcons } from '@ng-icons/core';
import { profileIcons, hlmImports } from './profile.hlmimports';

import {
  UserProfileDto,
  UpdateUserProfileDto,
  ExperienceLevel,
  WorkingStyle,
  CareerPreferenceType,
} from '@job-tracker-lite-angular/schemas';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, ...hlmImports],
  providers: [provideIcons(profileIcons)],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private readonly profileData = inject(ProfileDataAccessService);

  profileResource = this.profileData.profileResource;

  editingSection = signal<string | null>(null);
  editData: Partial<UserProfileDto> = {};

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
    } else if (section === 'preferences') {
      updateDto = {
        experienceLevel: this.editData.experienceLevel,
        workingStyle: this.editData.workingStyle,
        careerType: this.editData.careerType,
        preferenceVisibility: this.editData.preferenceVisibility,
      };
    }

    try {
      await this.profileData.updateProfile(updateDto);
      this.editingSection.set(null);
    } catch (error) {
      console.error('Failed to update profile', error);
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
