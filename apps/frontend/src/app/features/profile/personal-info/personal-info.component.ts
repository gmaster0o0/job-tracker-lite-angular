import { Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import {
  formImports,
  interactiveImports,
  layoutImports,
} from '../profile.hlmimports';
import {
  EditButtonComponent,
  SaveButtonComponent,
  CancelButtonComponent,
  InlineInputComponent,
  InlineTextareaComponent,
} from '@job-tracker-lite-angular/frontend-shared';
import {
  UserProfileDto,
  UpdateUserProfileDto,
} from '@job-tracker-lite-angular/schemas';
import { ProfileVisibilitySettingsComponent } from '../visibility-settings/visibility-settings.component';

@Component({
  standalone: true,
  selector: 'app-personal-info',
  imports: [
    formImports,
    interactiveImports,
    layoutImports,
    EditButtonComponent,
    CancelButtonComponent,
    SaveButtonComponent,
    TranslocoModule,
    CommonModule,
    InlineInputComponent,
    InlineTextareaComponent,
    ProfileVisibilitySettingsComponent,
  ],
  templateUrl: './personal-info.component.html',
})
export class PersonalInfoComponent {
  // current profile data from the parent component
  profile = input.required<UserProfileDto>();

  // Not saved data. Two-way bound to the form inputs. The parent component will provide the initial data and will be updated when the user edits the form.
  editData = model.required<Partial<UserProfileDto>>();

  // The parent component decides whether this section is currently being edited/saved
  isEditing = input(false);
  isSaving = input(false);
  disabled = input(false);
  // Event emitters to notify the parent component of user actions
  edit = output<void>();
  cancelEdit = output<void>();
  save = output<UpdateUserProfileDto>();
  // Updates the editData model when an input field changes. This allows for two-way binding between the form inputs and the editData model.
  updateField<K extends keyof UserProfileDto>(
    field: K,
    value: UserProfileDto[K],
  ) {
    this.editData.update((data) => ({ ...data, [field]: value }));
  }
  // Called when the user clicks the save button. It emits the current editData as an UpdateUserProfileDto to the parent component for saving.
  onSave() {
    const data = this.editData();
    const updateDto: UpdateUserProfileDto = {
      name: data.name,
      title: data.title,
      city: data.city,
      bio: data.bio,
      isPublic: data.isPublic,
      personalVisibility: data.personalVisibility,
    };
    this.save.emit(updateDto);
  }
}
