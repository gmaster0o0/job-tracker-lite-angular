import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { JobsDataAccessService } from './jobs.data-access';

describe('JobsDataAccessService', () => {
  let service: JobsDataAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), JobsDataAccessService],
    });
    service = TestBed.inject(JobsDataAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
