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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request the detailed health endpoint', () => {
    service.healthResource.reload();

    TestBed.flushEffects();

    const req = httpMock.expectOne('/api/health/detailed');
    expect(req.request.method).toBe('GET');
    req.flush({
      status: 'ok',
      info: {},
      error: {},
      details: {},
    });
  });
});
