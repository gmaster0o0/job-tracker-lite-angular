import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { ContactsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { vi } from 'vitest';
import { CreateContactComponent } from './create-contact.component';
import { CreateContactHarness } from './create-contact.harness';
import {
  contactFixtures,
  createContactFixtures,
  createContactsDataAccessMock,
} from '@job-tracker-lite-angular/testing';

describe('CreateContactComponent', () => {
  it('creates component', async () => {
    await TestBed.configureTestingModule({
      imports: [CreateContactComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(CreateContactComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateContactHarness,
    );
    expect(harness).toBeTruthy();
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
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateContactHarness,
    );

    await harness.fillForm(createContactFixtures.janeDoe);
    await harness.submit();

    expect(createContact).toHaveBeenCalledWith(
      0,
      createContactFixtures.janeDoe,
    );
  });
});
