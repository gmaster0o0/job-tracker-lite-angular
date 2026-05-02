import { TestBed } from '@angular/core/testing';
import { ContactsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { vi } from 'vitest';
import { CreateContactComponent } from './create-contact.component';
import {
  contactFixtures,
  createContactFixtures,
  createContactsDataAccessMock,
} from '@job-tracker-lite-angular/shared-testing';

describe('CreateContactComponent', () => {
  it('creates component', async () => {
    await TestBed.configureTestingModule({
      imports: [CreateContactComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(CreateContactComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should submit and call data access', async () => {
    const createContact = vi.fn().mockResolvedValue(contactFixtures.janeDoe);

    await TestBed.configureTestingModule({
      imports: [CreateContactComponent],
      providers: [
        {
          provide: ContactsDataAccessService,
          useValue: createContactsDataAccessMock({ createContact }),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateContactComponent);
    const component = fixture.componentInstance as any;

    component.form.setValue(createContactFixtures.janeDoe);

    await component.submit();

    expect(createContact).toHaveBeenCalledWith(
      0,
      createContactFixtures.janeDoe,
    );
  });
});
