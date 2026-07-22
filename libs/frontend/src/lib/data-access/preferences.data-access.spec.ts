import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PreferencesDataAccessService } from './preferences.data-access';
import { userPreferencesFixtures } from '@job-tracker-lite-angular/testing';

describe('PreferencesDataAccessService', () => {
  let service: PreferencesDataAccessService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), PreferencesDataAccessService],
    });

    service = TestBed.inject(PreferencesDataAccessService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch preferences via GET', async () => {
    const resultPromise = service.getPreferences();

    const req = httpMock.expectOne('/api/preferences');
    expect(req.request.method).toBe('GET');
    req.flush(userPreferencesFixtures.johnDoe);

    await expect(resultPromise).resolves.toEqual(
      userPreferencesFixtures.johnDoe,
    );
  });

  it('should reject when the GET response does not match the schema', async () => {
    const resultPromise = service.getPreferences();

    const req = httpMock.expectOne('/api/preferences');
    req.flush({ theme: 'not-a-real-theme' });

    await expect(resultPromise).rejects.toBeTruthy();
  });

  it('should send a partial update via PATCH', async () => {
    const updateDto = {
      theme: 'dark' as const,
      updatedAt: '2026-07-21T12:00:00.000Z',
    };
    const resultPromise = service.updatePreferences(updateDto);

    const req = httpMock.expectOne('/api/preferences');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(updateDto);
    req.flush(userPreferencesFixtures.johnDoe);

    await expect(resultPromise).resolves.toEqual(
      userPreferencesFixtures.johnDoe,
    );
  });
});
