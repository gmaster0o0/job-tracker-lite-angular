import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';
import {
  JobsDataAccessService,
  NotesDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  createJobsDataAccessMock,
  createNotesDataAccessMock,
} from '@job-tracker-lite-angular/testing';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { vi } from 'vitest';
import { NotesTabComponent } from './notes-tab.component';

describe('NotesTabComponent', () => {
  async function setup(notes: ContactDto[]) {
    const dialogMock = { open: vi.fn() };
    const jobsDataAccessMock = createJobsDataAccessMock({ notes });
    const notesDataAccessMock = createNotesDataAccessMock();

    await TestBed.configureTestingModule({
      imports: [NotesTabComponent],
      providers: [
        { provide: JobsDataAccessService, useValue: jobsDataAccessMock },
        {
          provide: NotesDataAccessService,
          useValue: notesDataAccessMock,
        },
        { provide: HlmDialogService, useValue: dialogMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(NotesTabComponent);
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
