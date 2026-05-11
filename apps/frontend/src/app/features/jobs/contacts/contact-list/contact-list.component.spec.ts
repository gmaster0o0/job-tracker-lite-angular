import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { createJobsDataAccessMock } from '@job-tracker-lite-angular/testing';
import { ContactListComponent } from './contact-list.component';
import { ContactListHarness } from './contact-list.harness';

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
    fixture.componentRef.setInput('jobId', '10');
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ContactListHarness,
    );

    return { harness };
  }

  it('should render contacts list', async () => {
    const { harness } = await setup([]);

    expect(await harness.getTextContent()).toContain('No contacts yet.');
  });
});
