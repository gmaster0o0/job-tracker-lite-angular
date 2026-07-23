import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { HealthDataAccessService } from './health.data-access';

describe('HealthDataAccessService', () => {
  let service: HealthDataAccessService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HealthDataAccessService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(HealthDataAccessService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const okBody = { status: 'ok', info: {}, error: {}, details: {} } as const;

  // Both resources load eagerly, so drain the sibling request the test under
  // inspection isn't asserting on to keep httpMock.verify() happy.
  function drainRemaining(): void {
    httpMock.match(() => true).forEach((req) => req.flush(okBody));
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request the detailed health endpoint', () => {
    service.healthResource.reload();

    TestBed.flushEffects();

    const req = httpMock.expectOne('/api/health/detailed');
    expect(req.request.method).toBe('GET');
    req.flush(okBody);

    drainRemaining();
  });

  it('should request the readiness health endpoint', () => {
    service.readinessResource.reload();

    TestBed.flushEffects();

    const req = httpMock.expectOne('/api/health/ready');
    expect(req.request.method).toBe('GET');
    req.flush(okBody);

    drainRemaining();
  });
});
