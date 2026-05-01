import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';
import {
  JobsDataAccessService,
  ContactsDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { vi } from 'vitest';
import { ContactTabComponent } from '../contact-tab/contact-tab.component';

describe('ContactTabComponent', () => {
  async function setup(contacts: ContactDto[]) {
    const dialogMock = { open: vi.fn() };
    const jobsDataAccessMock = {
      selectJob: () => {
        //empty
      },
      jobContactsResource: {
        isLoading: () => false,
        value: () => contacts,
      },
    };
    const contactsDataAccessMock = {
      deleteContact: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ContactTabComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        {
          provide: ContactsDataAccessService,
          useValue: contactsDataAccessMock,
        },
        { provide: HlmDialogService, useValue: dialogMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ContactTabComponent);
    fixture.componentRef.setInput('jobId', 10);
    fixture.detectChanges();

    return { fixture, dialogMock };
  }

  it('should render contact tab header and add button', async () => {
    const { fixture } = await setup([]);

    expect(fixture.nativeElement.textContent).toContain('Contacts');
    expect(
      fixture.debugElement.query(
        By.css('button[title="Add Contact"], button[type="button"]'),
      ),
    ).toBeTruthy();
  });

  it('should open create dialog when Add Contact clicked', async () => {
    const { fixture, dialogMock } = await setup([]);

    const button = fixture.debugElement.query(By.css('button[type="button"]'));
    button.nativeElement.click();

    expect(dialogMock.open).toHaveBeenCalled();
  });
});
