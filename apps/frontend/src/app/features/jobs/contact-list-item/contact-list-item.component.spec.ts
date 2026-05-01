import { TestBed } from '@angular/core/testing';
import { ContactDto } from '@job-tracker-lite-angular/api-interfaces';
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
    const contact = {
      id: 1,
      name: 'A',
      email: '',
      phoneNumber: '',
      jobId: 1,
      createdAt: '',
      updatedAt: '',
    } as ContactDto;
    const { fixture } = await setup(contact);
    expect(fixture.nativeElement.textContent).toContain('A');
  });
});
