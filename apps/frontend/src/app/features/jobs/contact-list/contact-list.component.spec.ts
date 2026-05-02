import { TestBed } from '@angular/core/testing';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { createJobsDataAccessMock } from '@job-tracker-lite-angular/shared-testing';
import { ContactListComponent } from './contact-list.component';

describe('ContactListComponent', () => {
  async function setup(contacts: ContactDto[]) {
    await TestBed.configureTestingModule({
      imports: [ContactListComponent],
      providers: [
        {
          provide: JobsDataAccessService,
          useValue: createJobsDataAccessMock({ contacts }),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ContactListComponent);
    fixture.componentRef.setInput('jobId', 10);
    fixture.detectChanges();

    return { fixture };
  }

  it('should render contacts list', async () => {
    const { fixture } = await setup([]);

    expect(fixture.nativeElement.textContent).toContain('No contacts yet.');
  });
});
