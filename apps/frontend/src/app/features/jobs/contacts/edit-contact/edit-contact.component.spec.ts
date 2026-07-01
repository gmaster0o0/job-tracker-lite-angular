import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import {
  ContactsDataAccessService,
  BackendError,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  contactFixtures,
  updateContactFixtures,
  createContactsDataAccessMock,
} from '@job-tracker-lite-angular/testing';
import { vi } from 'vitest';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { createBrnDialogRefMock } from '@job-tracker-lite-angular/testing';
import { EditContactComponent } from './edit-contact.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { EditContactHarness } from './edit-contact.harness';

describe('EditContactComponent', () => {
  let fixture: ComponentFixture<EditContactComponent>;
  let harness: EditContactHarness;
  let contactsDataAccessMock: any;

  beforeEach(async () => {
    contactsDataAccessMock = createContactsDataAccessMock();

    await TestBed.configureTestingModule({
      imports: [EditContactComponent, getTranslocoModule()],
      providers: [
        {
          provide: ContactsDataAccessService,
          useValue: contactsDataAccessMock,
        },
        {
          provide: DIALOG_DATA,
          useValue: {
            jobId: 'test-job-id',
            contact: contactFixtures.janeDoe,
          },
        },
        { provide: BrnDialogRef, useValue: createBrnDialogRefMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditContactComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditContactHarness,
    );
  });

  it('should create', async () => {
    expect(harness).toBeTruthy();
  });

  it('should keep submit disabled while form is invalid', async () => {
    // form starts invalid: janeDoe.phoneNumber ('12345') fails E.164 validation
    expect(await harness.isSubmitDisabled()).toBe(true);
  });

  it('should initialize form with contact data', async () => {
    expect(await harness.getNameValue()).toBe(contactFixtures.janeDoe.name);
    expect(await harness.getEmailValue()).toBe(
      contactFixtures.janeDoe.email ?? '',
    );
    expect(await harness.getPhoneValue()).toBe(
      contactFixtures.janeDoe.phoneNumber ?? '',
    );
  });

  it('should submit and update contact', async () => {
    const updateContact = vi
      .fn()
      .mockResolvedValue(contactFixtures.updatedContact);
    contactsDataAccessMock.updateContact = updateContact;

    await harness.fillForm(updateContactFixtures.updatedContact);
    await harness.submit();

    expect(updateContact).toHaveBeenCalledWith(
      'test-job-id',
      contactFixtures.janeDoe.id,
      updateContactFixtures.updatedContact,
    );
  });

  it('should not submit if form is invalid', async () => {
    const updateContact = vi.fn();
    contactsDataAccessMock.updateContact = updateContact;

    // For update schema, only name is required; email/phone are optional
    // So fill with missing name to make form invalid
    await harness.fillForm(updateContactFixtures.missingName);
    await harness.submit();

    expect(await harness.getNameErrorText()).toBeTruthy();
    expect(updateContact).not.toHaveBeenCalled();
  });

  it('should not submit if name is missing', async () => {
    const updateContact = vi.fn();
    contactsDataAccessMock.updateContact = updateContact;

    await harness.fillForm(updateContactFixtures.missingName);
    await harness.submit();

    expect(await harness.getNameErrorText()).toBeTruthy();
    expect(updateContact).not.toHaveBeenCalled();
  });

  it('should show a validation error if the email is invalid', async () => {
    const updateContact = vi.fn();
    contactsDataAccessMock.updateContact = updateContact;

    await harness.fillForm(updateContactFixtures.invalidEmail);
    await harness.submit();

    expect(await harness.getEmailErrorText()).toBeTruthy();
    expect(updateContact).not.toHaveBeenCalled();
  });

  it('should show a validation error if the phone number is invalid', async () => {
    const updateContact = vi.fn();
    contactsDataAccessMock.updateContact = updateContact;

    await harness.fillForm(updateContactFixtures.invalidPhone);
    await harness.submit();

    expect(await harness.getPhoneErrorText()).toBeTruthy();
    expect(updateContact).not.toHaveBeenCalled();
  });

  it('should allow submitting without email or phone number', async () => {
    const updateContact = vi
      .fn()
      .mockResolvedValue(contactFixtures.updatedContact);
    contactsDataAccessMock.updateContact = updateContact;

    await harness.fillForm(updateContactFixtures.missingEmailAndPhone);
    await harness.submit();

    // unlike create, update schema does not require at least one of email/phone
    expect(updateContact).toHaveBeenCalled();
    expect(await harness.getEmailErrorText()).toBeFalsy();
    expect(await harness.getPhoneErrorText()).toBeFalsy();
  });

  it('should set submit error on failure', async () => {
    const backendError = new Error('Backend error: not_unique') as BackendError;
    (backendError as any).errorCode = 'not_unique';
    (backendError as any).statusCode = 409;

    const updateContact = vi.fn().mockRejectedValue(backendError);
    contactsDataAccessMock.updateContact = updateContact;

    await harness.fillForm(updateContactFixtures.updatedContact);
    await harness.submit();

    expect(await harness.isErrorVisible()).toBe(true);
    expect(await harness.getErrorText()).toBeTruthy();
  });
});
