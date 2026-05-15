import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { ContactDto } from '@job-tracker-lite-angular/schemas';
import {
  JobsDataAccessService,
  ContactsDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  createContactsDataAccessMock,
  createJobsDataAccessMock,
} from '@job-tracker-lite-angular/testing';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { vi } from 'vitest';
import { ContactsTabComponent } from './contacts-tab.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { ContactsTabHarness } from './contacts-tab.harness';

describe('ContactsTabComponent', () => {
  async function setup(contacts: ContactDto[]) {
    const dialogMock = { open: vi.fn() };
    const jobsDataAccessMock = createJobsDataAccessMock({ contacts });
    const contactsDataAccessMock = createContactsDataAccessMock();

    await TestBed.configureTestingModule({
      imports: [ContactsTabComponent, getTranslocoModule()],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        {
          provide: ContactsDataAccessService,
          useValue: contactsDataAccessMock,
        },
        { provide: HlmDialogService, useValue: dialogMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ContactsTabComponent);
    fixture.componentRef.setInput('jobId', '10');
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ContactsTabHarness,
    );

    return { fixture, harness, dialogMock };
  }

  it('should render contact tab header and add button', async () => {
    const { harness } = await setup([]);

    expect(await harness.getHeaderText()).toContain('Contacts');
    expect(await harness.hasAddContactButton()).toBe(true);
  });

  it('should open create dialog when Add Contact clicked', async () => {
    const { harness, dialogMock } = await setup([]);

    await harness.clickAddContact();

    expect(dialogMock.open).toHaveBeenCalled();
  });
});
