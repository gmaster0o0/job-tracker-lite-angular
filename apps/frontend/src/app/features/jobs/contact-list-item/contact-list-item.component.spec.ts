import { TestBed } from '@angular/core/testing';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';
import { contactFixtures } from '@job-tracker-lite-angular/shared-testing';
import { ContactListItemComponent } from './contact-list-item.component';

describe('ContactListItemComponent', () => {
  async function setup(contact: ContactDto) {
    await TestBed.configureTestingModule({
      imports: [ContactListItemComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ContactListItemComponent);
    fixture.componentRef.setInput('contact', contact);
    fixture.detectChanges();

    return { fixture };
  }

  it('should render contact name', async () => {
    const { fixture } = await setup(contactFixtures.janeDoe as ContactDto);
    expect(fixture.nativeElement.textContent).toContain('Jane Doe');
  });
});
