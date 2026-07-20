import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HealthDataAccessService } from './health.data-access';

describe('HealthDataAccessService', () => {
  let service: HealthDataAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HealthDataAccessService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(HealthDataAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
