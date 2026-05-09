import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';
import { contactFixtures } from '@job-tracker-lite-angular/testing';
import { ContactListItemComponent } from './contact-list-item.component';
import { ContactListItemHarness } from './contact-list-item.harness';

describe('ContactListItemComponent', () => {
  async function setup(contact: ContactDto) {
    await TestBed.configureTestingModule({
      imports: [ContactListItemComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ContactListItemComponent);
    fixture.componentRef.setInput('contact', contact);
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ContactListItemHarness,
    );

    return { harness };
  }

  it('should render contact name', async () => {
    const { harness } = await setup(contactFixtures.janeDoe as ContactDto);
    expect(await harness.getTextContent()).toContain('Jane Doe');
  });
});
