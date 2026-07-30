import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JobsMenuComponent } from './jobs-menu.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { JobsDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  createJobsDataAccessMock,
  jobFixtures,
} from '@job-tracker-lite-angular/testing';
import { JobsMenuHarness } from './jobs-menu.harness';
import { provideRouter } from '@angular/router';

describe('JobsMenuComponent', () => {
  let fixture: ComponentFixture<JobsMenuComponent>;
  let harness: JobsMenuHarness;

  async function setup(jobs = [jobFixtures.frontendEngineer]): Promise<void> {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [JobsMenuComponent, getTranslocoModule()],
      providers: [
        {
          provide: JobsDataAccessService,
          useValue: createJobsDataAccessMock({ jobs }),
        },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobsMenuComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      JobsMenuHarness,
    );
  }

  // Drives the effect that feeds the settled query into the list.
  async function settleSearch(): Promise<void> {
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', async () => {
    await setup();
    expect(harness).toBeTruthy();
  });

  describe('debounced search', () => {
    const jobs = [
      jobFixtures.frontendEngineer,
      jobFixtures.backendEngineer,
      jobFixtures.dataAnalyst,
    ];

    it('lists every job before anything is typed', async () => {
      await setup(jobs);
      expect(await harness.getJobCardCount()).toBe(3);
    });

    it('keeps the full list until the debounce window elapses', async () => {
      await setup(jobs);
      vi.useFakeTimers();

      await harness.setSearchQuery('Frontend');
      await vi.advanceTimersByTimeAsync(200);
      await settleSearch();

      expect(await harness.getJobCardCount()).toBe(3);
    });

    it('filters by position once the debounce window elapses', async () => {
      await setup(jobs);
      vi.useFakeTimers();

      await harness.setSearchQuery('Frontend');
      await vi.advanceTimersByTimeAsync(250);
      await settleSearch();

      const texts = await harness.getJobCardTexts();
      expect(texts).toHaveLength(1);
      expect(texts[0]).toContain('Frontend Engineer');
    });

    it('filters by company as well as position', async () => {
      await setup(jobs);
      vi.useFakeTimers();

      await harness.setSearchQuery('globex');
      await vi.advanceTimersByTimeAsync(250);
      await settleSearch();

      const texts = await harness.getJobCardTexts();
      expect(texts).toHaveLength(1);
      expect(texts[0]).toContain('Backend Engineer');
    });

    it('applies only the last of a burst of keystrokes', async () => {
      await setup(jobs);
      vi.useFakeTimers();

      await harness.setSearchQuery('F');
      await vi.advanceTimersByTimeAsync(100);
      await harness.setSearchQuery('Fr');
      await vi.advanceTimersByTimeAsync(100);
      await harness.setSearchQuery('Data');
      await vi.advanceTimersByTimeAsync(250);
      await settleSearch();

      const texts = await harness.getJobCardTexts();
      expect(texts).toHaveLength(1);
      expect(texts[0]).toContain('Data Analyst');
    });

    it('restores the full list when the query is cleared', async () => {
      await setup(jobs);
      vi.useFakeTimers();

      await harness.setSearchQuery('Frontend');
      await vi.advanceTimersByTimeAsync(250);
      await settleSearch();
      expect(await harness.getJobCardCount()).toBe(1);

      await harness.setSearchQuery('');
      await vi.advanceTimersByTimeAsync(250);
      await settleSearch();

      expect(await harness.getJobCardCount()).toBe(3);
    });
  });
});
