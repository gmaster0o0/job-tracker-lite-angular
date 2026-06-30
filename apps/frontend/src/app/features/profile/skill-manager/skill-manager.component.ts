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
import { hlmImports } from '../profile.hlmimports';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  standalone: true,
  selector: 'app-skill-manager',
  imports: [
    CommonModule,
    TranslocoModule,
    hlmImports,
    HlmSpinner,
    BrnComboboxMultiple,
    BrnComboboxAnchor,
    BrnComboboxPopoverTrigger,
    BrnComboboxChipInput,
    BrnComboboxContent,
    BrnComboboxEmpty,
    BrnComboboxList,
    BrnComboboxItem,
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

  protected readonly baseSkillSuggestions = [
    'Angular',
    'TypeScript',
    'JavaScript',
    'NestJS',
    'Node.js',
    'RxJS',
    'Prisma',
    'PostgreSQL',
    'TailwindCSS',
    'HTML',
    'CSS',
  ];

  private readonly savedSkills = linkedSignal(() => [
    ...this.profile().coreSkills,
  ]);
  protected readonly draftSkills = linkedSignal(() => [
    ...this.profile().coreSkills,
  ]);

  protected readonly isDirty = computed(
    () => !this.areSkillsEqual(this.savedSkills(), this.draftSkills()),
  );

  protected readonly autocompleteSuggestions = computed(() =>
    Array.from(
      new Set([
        ...this.baseSkillSuggestions,
        ...this.savedSkills(),
        ...this.draftSkills(),
      ]),
    ),
  );

  protected readonly filteredSuggestions = computed(() => {
    const query = this.newSkill().trim().toLowerCase();
    if (!query) {
      return [];
    }

    return this.autocompleteSuggestions().filter(
      (suggestion) =>
        suggestion.toLowerCase().includes(query) &&
        !this.draftSkills().includes(suggestion),
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
      (suggestion) => suggestion.toLowerCase() === candidateLower,
    );

    return !existsInDraft && !existsAsSuggestion;
  });

  protected onSearchChange(search: string) {
    this.newSkill.set(search);
  }

  protected onSuggestionSelected(skills: string[] | null | undefined) {
    const pickedSkills = skills ?? [];
    const addedSkill = pickedSkills.find(
      (skill) => !this.draftSkills().includes(skill),
    );

    if (addedSkill) {
      this.addSkill(addedSkill);
    }

    this.selectedSuggestion.set([]);
    this.newSkill.set('');
  }

  protected addSkillFromInput() {
    this.addSkill(this.newSkill());
  }

  protected removeSkill(skillToRemove: string) {
    this.draftSkills.update((skills) =>
      skills.filter((skill) => skill !== skillToRemove),
    );
  }

  protected discardChanges() {
    this.draftSkills.set([...this.savedSkills()]);
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
      await this.profileData.updateProfile({ coreSkills: nextSkills });
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
    if (!trimmedSkill || this.draftSkills().includes(trimmedSkill)) {
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
