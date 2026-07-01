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
  ],
  templateUrl: './personal-info.component.html',
})
export class PersonalInfoComponent {
  // Az aktuális, elmentett profil (a szülő resource-ából jön)
  profile = input.required<UserProfileDto>();

  // Szerkesztés alatt lévő, még nem mentett adatok - kétirányú kötés a szülővel
  editData = model.required<Partial<UserProfileDto>>();

  // A szülő dönti el, hogy épp ez a szekció van-e szerkesztés/mentés alatt
  isEditing = input(false);
  isSaving = input(false);

  // Pl. mert egy másik szekció épp szerkesztés/mentés alatt van
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
