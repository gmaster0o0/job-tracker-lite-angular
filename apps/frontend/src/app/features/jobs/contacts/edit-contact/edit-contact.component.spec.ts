import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { ContactsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { vi } from 'vitest';
import { EditContactComponent } from './edit-contact.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { UpdateContactDto } from '@job-tracker-lite-angular/schemas';
import { EditContactHarness } from './edit-contact.harness';
import {
  contactFixtures,
  createContactsDataAccessMock,
  updateContactFixtures,
} from '@job-tracker-lite-angular/testing';

describe('EditContactComponent', () => {
  it('should submit and call update', async () => {
    const updateContact = vi
      .fn()
      .mockResolvedValue(contactFixtures.updatedContact);

    await TestBed.configureTestingModule({
      imports: [EditContactComponent, getTranslocoModule()],
      providers: [
        {
          provide: ContactsDataAccessService,
          useValue: createContactsDataAccessMock({ updateContact }),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditContactComponent);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditContactHarness,
    );

    await harness.fillForm(updateContactFixtures.updatedContact);
    await harness.submit();

    expect(updateContact).toHaveBeenCalledWith(0, 0, {
      name: 'Updated',
      email: 'updated@example.com',
      phoneNumber: '999',
    } as UpdateContactDto);
  });
});
