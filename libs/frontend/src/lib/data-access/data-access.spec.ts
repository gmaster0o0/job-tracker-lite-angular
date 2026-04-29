import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DataAccessService } from './data-access';

describe('DataAccessService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DataAccessService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  it('should create', () => {
    expect(TestBed.inject(DataAccessService)).toBeTruthy();
  });
});
