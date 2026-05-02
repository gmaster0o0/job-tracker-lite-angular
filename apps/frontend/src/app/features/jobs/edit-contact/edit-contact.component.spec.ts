import { TestBed } from '@angular/core/testing';
import { ContactsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { vi } from 'vitest';
import { EditContactComponent } from './edit-contact.component';
import { UpdateContactDto } from '@job-tracker-lite-angular/api-interfaces';
import {
  contactFixtures,
  createContactsDataAccessMock,
  updateContactFixtures,
} from '@job-tracker-lite-angular/shared-testing';

describe('EditContactComponent', () => {
  it('should submit and call update', async () => {
    const updateContact = vi
      .fn()
      .mockResolvedValue(contactFixtures.updatedContact);

    await TestBed.configureTestingModule({
      imports: [EditContactComponent],
      providers: [
        {
          provide: ContactsDataAccessService,
          useValue: createContactsDataAccessMock({ updateContact }),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditContactComponent);
    const component = fixture.componentInstance as any;

    component.form.setValue(
      updateContactFixtures.updatedContact as UpdateContactDto,
    );

    await component.submit();

    expect(updateContact).toHaveBeenCalledWith(0, 0, {
      name: 'Updated',
      email: 'updated@example.com',
      phoneNumber: '999',
    } as UpdateContactDto);
  });
});
