import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
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

  // Signals for profile state
  private readonly modProfileData = signal<UserProfileDto | null>(null);
  private readonly isLoadingMod = signal(false);

  // Fetch profile when mode or targetUserId changes
  constructor() {
    effect(() => {
      const currentMode = this.mode();
      const userId = this.targetUserId();

      if (currentMode === 'mod' && userId) {
        untracked(() => void this.fetchModProfile(userId));
      }
    });
  }

  private async fetchModProfile(userId: string): Promise<void> {
    try {
      this.isLoadingMod.set(true);
      const profile = await this.profileDataAccess.getUserProfile(userId);
      this.modProfileData.set(profile);
    } finally {
      this.isLoadingMod.set(false);
    }
  }

  // Use the appropriate profile based on mode
  protected readonly profile = computed(() => {
    if (this.mode() === 'mod') {
      return this.modProfileData();
    }
    return this.profileDataAccess.profileResource.value();
  });

  protected readonly profileResource = computed(() => {
    if (this.mode() === 'mod') {
      return {
        value: () => this.modProfileData(),
        isLoading: () => this.isLoadingMod(),
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
        // Moderator editing another user's profile
        await this.profileDataAccess.updateUserProfile(userId, updateDto);
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
