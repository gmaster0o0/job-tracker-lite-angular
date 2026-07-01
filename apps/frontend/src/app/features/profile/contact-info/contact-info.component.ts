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
} from '@job-tracker-lite-angular/frontend-shared';
import {
  UserProfileDto,
  UpdateUserProfileDto,
} from '@job-tracker-lite-angular/schemas';

@Component({
  standalone: true,
  selector: 'app-contact-info',
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
  ],
  templateUrl: './contact-info.component.html',
})
export class ContactInfoComponent {
  profile = input.required<UserProfileDto>();
  editData = model.required<Partial<UserProfileDto>>();

  isEditing = input(false);
  isSaving = input(false);
  disabled = input(false);

  edit = output<void>();
  cancelEdit = output<void>();
  save = output<UpdateUserProfileDto>();

  updateField<K extends keyof UserProfileDto>(
    field: K,
    value: UserProfileDto[K],
  ) {
    this.editData.update((data) => ({ ...data, [field]: value }));
  }

  onSave() {
    const data = this.editData();
    const updateDto: UpdateUserProfileDto = {
      email: data.email,
      linkedin: data.linkedin,
      github: data.github,
      webpage: data.webpage,
      contactVisibility: data.contactVisibility,
    };
    this.save.emit(updateDto);
  }
}
