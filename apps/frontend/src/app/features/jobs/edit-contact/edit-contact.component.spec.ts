import { TestBed } from '@angular/core/testing';
import { ContactsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { vi } from 'vitest';
import { EditContactComponent } from './edit-contact.component';
import { UpdateContactDto } from '@job-tracker-lite-angular/api-interfaces';

describe('EditContactComponent', () => {
  it('should submit and call update', async () => {
    const updateContact = vi.fn().mockResolvedValue({ id: 1 });

    await TestBed.configureTestingModule({
      imports: [EditContactComponent],
      providers: [
        { provide: ContactsDataAccessService, useValue: { updateContact } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditContactComponent);
    const component = fixture.componentInstance as any;

    component.form.setValue({
      name: 'Updated',
      email: 'updated@example.com',
      phoneNumber: '999',
    } as UpdateContactDto);

    await component.submit();

    expect(updateContact).toHaveBeenCalledWith(0, 0, {
      name: 'Updated',
      email: 'updated@example.com',
      phoneNumber: '999',
    } as UpdateContactDto);
  });
});
