import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import {
  ContactsDataAccessService,
  BackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  contactFixtures,
  createContactFixtures,
  createContactsDataAccessMock,
} from '@job-tracker-lite-angular/testing';
import { vi } from 'vitest';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { createBrnDialogRefMock } from '@job-tracker-lite-angular/testing';
import { CreateContactComponent } from './create-contact.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { CreateContactHarness } from './create-contact.harness';

describe('CreateContactComponent', () => {
  let fixture: ComponentFixture<CreateContactComponent>;
  let harness: CreateContactHarness;
  let contactsDataAccessMock: any;

  beforeEach(async () => {
    contactsDataAccessMock = createContactsDataAccessMock();

    await TestBed.configureTestingModule({
      imports: [CreateContactComponent, getTranslocoModule()],
      providers: [
        {
          provide: ContactsDataAccessService,
          useValue: contactsDataAccessMock,
        },
        {
          provide: DIALOG_DATA,
          useValue: { jobId: 'test-job-id' },
        },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateContactComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CreateContactHarness,
    );
  });

  it('should create', async () => {
    expect(harness).toBeTruthy();
  });

  it('should keep submit disabled while form is invalid', async () => {
    fixture.detectChanges();
    expect(await harness.isSubmitDisabled()).toBe(true);
  });

  it('should submit and create contact', async () => {
    const createContact = vi.fn().mockResolvedValue(contactFixtures.janeDoe);
    contactsDataAccessMock.createContact = createContact;

    fixture.detectChanges();

    await harness.fillForm(createContactFixtures.janeDoe);
    await harness.submit();

    expect(createContact).toHaveBeenCalledWith(
      'test-job-id',
      createContactFixtures.janeDoe,
    );
  });

  it('should not submit if form invalid', async () => {
    const createContact = vi.fn();
    contactsDataAccessMock.createContact = createContact;

    fixture.detectChanges();

    await harness.fillForm(createContactFixtures.allEmpty);
    await harness.submit();
    fixture.detectChanges();

    expect(await harness.getNameErrorText()).toBeTruthy();
    expect(await harness.getEmailErrorText()).toBeTruthy();
    expect(await harness.getPhoneErrorText()).toBeTruthy();
    expect(createContact).not.toHaveBeenCalled();
  });

  it('should show validation error if the name is missing', async () => {
    const createContact = vi.fn();
    contactsDataAccessMock.createContact = createContact;

    fixture.detectChanges();

    await harness.fillForm(createContactFixtures.missingName);
    await harness.submit();
    fixture.detectChanges();

    expect(await harness.getNameErrorText()).toBeTruthy();
    expect(createContact).not.toHaveBeenCalled();
  });

  it('should show a validation error if the email is invalid', async () => {
    const createContact = vi.fn();
    contactsDataAccessMock.createContact = createContact;

    fixture.detectChanges();

    await harness.fillForm(createContactFixtures.invalidEmail);
    await harness.submit();
    fixture.detectChanges();

    expect(await harness.getEmailErrorText()).toBeTruthy();
    expect(createContact).not.toHaveBeenCalled();
  });

  it('should show a validation error if the phone number is invalid', async () => {
    const createContact = vi.fn();
    contactsDataAccessMock.createContact = createContact;

    fixture.detectChanges();

    await harness.fillForm(createContactFixtures.invalidPhone);
    await harness.submit();
    fixture.detectChanges();

    expect(await harness.getPhoneErrorText()).toBeTruthy();
    expect(createContact).not.toHaveBeenCalled();
  });

  it('should show a validation error if email or phone number is missing', async () => {
    const createContact = vi.fn();
    contactsDataAccessMock.createContact = createContact;

    fixture.detectChanges();

    await harness.fillForm(createContactFixtures.missingEmailAndPhone);
    await harness.submit();
    fixture.detectChanges();

    expect(await harness.getEmailErrorText()).toContain('Please provide');
    expect(await harness.getPhoneErrorText()).toContain('Please provide');
    expect(createContact).not.toHaveBeenCalled();
  });

  it('should set submit error on failure', async () => {
    const backendError = new Error('Backend error: not_unique') as BackendError;
    (backendError as any).errorCode = 'not_unique';
    (backendError as any).statusCode = 409;

    const createContact = vi.fn().mockRejectedValue(backendError);
    contactsDataAccessMock.createContact = createContact;

    fixture.detectChanges();

    await harness.fillForm(createContactFixtures.janeDoe);
    await harness.submit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(await harness.isErrorVisible()).toBe(true);
    expect(await harness.getErrorText()).toBeTruthy();
  });
});
