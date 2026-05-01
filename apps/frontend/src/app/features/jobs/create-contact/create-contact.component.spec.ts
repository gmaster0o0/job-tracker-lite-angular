import { TestBed } from '@angular/core/testing';
import { ContactsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { vi } from 'vitest';
import { CreateContactComponent } from './create-contact.component';

describe('CreateContactComponent', () => {
  it('creates component', async () => {
    await TestBed.configureTestingModule({
      imports: [CreateContactComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(CreateContactComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should submit and call data access', async () => {
    const createContact = vi.fn().mockResolvedValue({ id: 1 });

    await TestBed.configureTestingModule({
      imports: [CreateContactComponent],
      providers: [
        {
          provide: ContactsDataAccessService,
          useValue: { createContact },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateContactComponent);
    const component = fixture.componentInstance as any;

    component.form.setValue({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phoneNumber: '12345',
    });

    await component.submit();

    expect(createContact).toHaveBeenCalledWith(0, {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phoneNumber: '12345',
    });
  });
});
