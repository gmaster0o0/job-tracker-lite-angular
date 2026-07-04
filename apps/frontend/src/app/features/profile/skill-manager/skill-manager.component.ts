import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import {
  lucideAlertCircle,
  lucideCheck,
  lucidePlusCircle,
  lucideX,
} from '@ng-icons/lucide';
import {
  BrnComboboxAnchor,
  BrnComboboxChipInput,
  BrnComboboxContent,
  BrnComboboxEmpty,
  BrnComboboxItem,
  BrnComboboxList,
  BrnComboboxMultiple,
  BrnComboboxPopoverTrigger,
} from '@spartan-ng/brain/combobox';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { UserProfileDto } from '@job-tracker-lite-angular/schemas';
import {
  formImports,
  interactiveImports,
  layoutImports,
} from '../profile.hlmimports';
import { ProfileVisibilitySettingsComponent } from '../visibility-settings/visibility-settings.component';

import baseSkillSuggestions from '../../../../../public/assets/baseSkillSuggestions.json';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type Suggestion = { value: string; label: string };

@Component({
  standalone: true,
  selector: 'app-skill-manager',
  imports: [
    CommonModule,
    TranslocoModule,
    formImports,
    interactiveImports,
    layoutImports,
    HlmSpinner,
    BrnComboboxMultiple,
    BrnComboboxAnchor,
    BrnComboboxPopoverTrigger,
    BrnComboboxChipInput,
    BrnComboboxContent,
    BrnComboboxEmpty,
    BrnComboboxList,
    BrnComboboxItem,
    ProfileVisibilitySettingsComponent,
  ],
  providers: [
    provideIcons({
      lucideCheck,
      lucideAlertCircle,
      lucidePlusCircle,
      lucideX,
    }),
  ],
  templateUrl: './skill-manager.component.html',
})
export class SkillManagerComponent {
  private readonly profileData = inject(ProfileDataAccessService);

  profile = input.required<UserProfileDto>();
  disabled = input<boolean>(false);

  readonly saveStateChanged = output<SaveState>();

  protected readonly saveState = signal<SaveState>('idle');
  protected readonly newSkill = signal('');
  protected readonly selectedSuggestion = signal<string[]>([]);

  protected readonly baseSkillSuggestions: Suggestion[] = baseSkillSuggestions;

  protected readonly draftVisibility = linkedSignal(
    () => this.profile().skillsVisibility ?? 0,
  );

  protected onVisibilityChange(level: number) {
    this.draftVisibility.set(level);
  }

  private readonly savedSkills = linkedSignal(() => [
    ...this.profile().coreSkills,
  ]);
  protected readonly draftSkills = linkedSignal(() => [
    ...this.profile().coreSkills,
  ]);

  protected readonly displaySkills = computed(() =>
    this.draftSkills().map((skillValue) => {
      const matchedSuggestion = this.baseSkillSuggestions.find(
        (suggestion) =>
          suggestion.value.toLowerCase() === skillValue.toLowerCase(),
      );
      return {
        value: skillValue,
        label: matchedSuggestion ? matchedSuggestion.label : skillValue,
      };
    }),
  );

  protected readonly isDirty = computed(
    () =>
      !this.areSkillsEqual(this.savedSkills(), this.draftSkills()) ||
      this.profile().skillsVisibility !== this.draftVisibility(),
  );

  protected readonly autocompleteSuggestions = computed(() => {
    const suggestionsFromBase = this.baseSkillSuggestions.map((suggestion) => ({
      value: suggestion.value,
      label: suggestion.label,
    }));

    const suggestionsFromExisting = [
      ...this.savedSkills(),
      ...this.draftSkills(),
    ]
      .filter(
        (skillValue) =>
          !this.baseSkillSuggestions.some(
            (suggestion) =>
              suggestion.value.toLowerCase() === skillValue.toLowerCase(),
          ),
      )
      .map((skillValue) => ({ value: skillValue, label: skillValue }));

    return [...suggestionsFromBase, ...suggestionsFromExisting];
  });

  protected readonly filteredSuggestions = computed(() => {
    const query = this.newSkill().trim().toLowerCase();
    if (!query) {
      return [];
    }

    return this.autocompleteSuggestions().filter(
      (suggestion) =>
        suggestion.label.toLowerCase().includes(query) &&
        !this.draftSkills().some(
          (draftSkill) =>
            draftSkill.toLowerCase() === suggestion.value.toLowerCase(),
        ),
    );
  });

  protected readonly canAddNewElement = computed(() => {
    const candidate = this.newSkill().trim();
    if (!candidate) {
      return false;
    }

    const candidateLower = candidate.toLowerCase();

    const existsInDraft = this.draftSkills().some(
      (skill) => skill.toLowerCase() === candidateLower,
    );
    const existsAsSuggestion = this.autocompleteSuggestions().some(
      (suggestion) =>
        suggestion.value.toLowerCase() === candidateLower ||
        suggestion.label.toLowerCase() === candidateLower,
    );

    return !existsInDraft && !existsAsSuggestion;
  });

  protected onSearchChange(search: string | Event) {
    const value =
      typeof search === 'string'
        ? search
        : (search.target as HTMLInputElement).value;
    this.newSkill.set(value);
  }

  protected onSuggestionSelected(skills: string[] | null | undefined) {
    const pickedSkills = skills ?? [];
    const addedSkill = pickedSkills.find(
      (skill) =>
        !this.draftSkills().some(
          (draftSkill) => draftSkill.toLowerCase() === skill.toLowerCase(),
        ),
    );

    if (addedSkill) {
      this.addSkill(addedSkill);
    }

    this.selectedSuggestion.set([]);
    this.newSkill.set('');
  }

  protected addSkillFromInput(value?: string) {
    this.addSkill(value ?? this.newSkill());
  }

  protected removeSkill(skillToRemove: string) {
    this.draftSkills.update((skills) =>
      skills.filter((skill) => skill !== skillToRemove),
    );
  }

  protected discardChanges() {
    this.draftSkills.set([...this.savedSkills()]);
    this.draftVisibility.set(this.profile().skillsVisibility ?? 0);
    this.newSkill.set('');
    this.setSaveState('idle');
  }

  protected async saveChanges() {
    if (!this.isDirty()) {
      return;
    }

    this.setSaveState('saving');

    try {
      const nextSkills = [...this.draftSkills()];
      const nextVisibility = this.draftVisibility();

      await this.profileData.updateProfile({
        coreSkills: nextSkills,
        skillsVisibility: nextVisibility,
      });
      this.savedSkills.set(nextSkills);
      this.setSaveState('saved');

      setTimeout(() => {
        this.setSaveState('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to save skills', error);
      this.setSaveState('error');

      setTimeout(() => {
        this.setSaveState('idle');
      }, 2000);
    }
  }

  private addSkill(skillValue: string) {
    const trimmedSkill = skillValue.trim();
    if (
      !trimmedSkill ||
      this.draftSkills().some(
        (skill) => skill.toLowerCase() === trimmedSkill.toLowerCase(),
      )
    ) {
      return;
    }

    this.draftSkills.update((skills) => [...skills, trimmedSkill]);
    this.newSkill.set('');
  }

  private setSaveState(state: SaveState) {
    this.saveState.set(state);
    this.saveStateChanged.emit(state);
  }

  private areSkillsEqual(left: string[], right: string[]): boolean {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((skill, index) => skill === right[index]);
  }
}
