import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HealthResponseDto } from '@job-tracker-lite-angular/schemas';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  createDataAccessMock,
  degradedHealth,
  healthFixture,
} from '@job-tracker-lite-angular/testing';
import { describe, expect, it } from 'vitest';
import { StatusComponent } from './status.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { StatusHarness } from './status.harness';

describe('StatusComponent', () => {
  async function setup(options?: {
    health?: HealthResponseDto | null;
    isLoading?: boolean;
    error?: unknown;
    hasValue?: boolean;
  }) {
    const dataAccessMock = createDataAccessMock(options);

    await TestBed.configureTestingModule({
      imports: [StatusComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: DataAccessService, useValue: dataAccessMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(StatusComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      StatusHarness,
    );

    return { fixture, harness };
  }

  it('should render API and database status from health data', async () => {
    const { harness } = await setup({ health: healthFixture });

    expect(await harness.getApiStatus()).toContain('OK');
    expect(await harness.getDatabaseStatus()).toContain('UP');
    expect(await harness.getTimestamp()).toBeTruthy();
    expect(await harness.getUptime()).toContain('Uptime:');
  });

  it('should show loading state while health resource is loading', async () => {
    const { harness } = await setup({
      health: null,
      hasValue: false,
      isLoading: true,
    });

    expect(await harness.isLoading()).toBe(true);
    expect(await harness.hasErrorMessage()).toBe(false);
  });

  it('should show error state when health loading fails', async () => {
    const { harness } = await setup({
      health: null,
      hasValue: false,
      isLoading: false,
      error: new HttpErrorResponse({ status: 500 }),
    });

    expect(await harness.hasErrorMessage()).toBe(true);
    expect(await harness.getErrorText()).toContain(
      'Failed to load health check data.',
    );
  });

  it('should render status from 503 payload returned by backend', async () => {
    const { harness } = await setup({
      health: null,
      hasValue: false,
      error: new HttpErrorResponse({
        status: 503,
        error: degradedHealth,
      }),
    });

    expect(await harness.getApiStatus()).toContain('ERROR');
    expect(await harness.getDatabaseStatus()).toContain('DOWN');
  });
});
