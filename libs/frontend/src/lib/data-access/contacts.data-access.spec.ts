import { TestBed } from '@angular/core/testing';
import {ContactsDataAccessService} from './contacts.data-access';

describe('ContactsDataAccessService', () => {
  let service: ContactsDataAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContactsDataAccessService],
    });
    service = TestBed.inject(ContactsDataAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
