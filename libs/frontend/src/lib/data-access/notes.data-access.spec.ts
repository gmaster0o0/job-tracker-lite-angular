import { TestBed } from '@angular/core/testing';
import { NotesDataAccessService } from './notes.data-access';

describe('NotesDataAccessService', () => {
  let service: NotesDataAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotesDataAccessService],
    });
    service = TestBed.inject(NotesDataAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
