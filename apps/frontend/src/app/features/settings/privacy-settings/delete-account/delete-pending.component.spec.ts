import { createNotificationServiceMock } from '@job-tracker-lite-angular/testing';
import { NotificationService } from '@job-tracker-lite-angular/frontend-data-access';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { AccountDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import {
  createBackendError,
  accountDeletionStatusFixtures,
  createAccountDataAccessMock,
} from '@job-tracker-lite-angular/testing';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { vi } from 'vitest';
import { provideRouter, Router } from '@angular/router';
import { DeletePendingComponent } from './delete-pending.component';
import { DeletePendingHarness } from './delete-pending.harness';

describe('DeletePendingComponent', () => {
  async function setup(statusFixture = accountDeletionStatusFixtures.pending) {
    const accountDataAccessMock = createAccountDataAccessMock({
      deletionStatus: statusFixture,
    });

    const dialogServiceMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DeletePendingComponent, getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useValue: createNotificationServiceMock(),
        },
        provideRouter([]),
        { provide: AccountDataAccessService, useValue: accountDataAccessMock },
        { provide: HlmDialogService, useValue: dialogServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DeletePendingComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      DeletePendingHarness,
    );

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true as never);

    return {
      fixture,
      harness,
      accountDataAccessMock,
      dialogServiceMock,
      router,
    };
  }

  it('displays countdown when pending', async () => {
    const { harness } = await setup();

    const text = await harness.getCountdownText();
    expect(text).toContain('d');
    expect(text).toContain('h');
    expect(text).toContain('m');
  });

  it('renders the remaining time from the scheduled deletion date', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T09:49:00.000Z'));

    try {
      const { harness } = await setup({
        status: 'pending_deletion',
        gracePeriodRequestedAt: new Date('2026-01-01T00:00:00.000Z'),
        scheduledDeletionAt: new Date('2026-01-02T12:00:00.000Z'),
        gracePeriodDays: 7,
      });

      expect(await harness.getCountdownText()).toContain('1d 2h 11m');
    } finally {
      vi.useRealTimers();
    }
  });

  it('opens recover dialog and recovers account on confirm', async () => {
    const { harness, dialogServiceMock, accountDataAccessMock, router } =
      await setup();

    await harness.clickRecoverButton();

    expect(dialogServiceMock.open).toHaveBeenCalled();

    const dialogOptions = dialogServiceMock.open.mock.calls[0]?.[1] as {
      context: { onConfirm: () => Promise<void> };
    };

    const recoverSpy = vi
      .spyOn(accountDataAccessMock, 'recoverAccountDeletion')
      .mockResolvedValue(undefined as unknown as void);

    await dialogOptions.context.onConfirm();

    expect(recoverSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/privacy'], {
      queryParams: { accountDeletion: 'recovered' },
    });
  });

  it('shows backend error when recover fails', async () => {
    const { harness, dialogServiceMock, accountDataAccessMock } = await setup();

    vi.spyOn(accountDataAccessMock, 'recoverAccountDeletion').mockRejectedValue(
      createBackendError('unknown', 500) as unknown as Error,
    );

    await harness.clickRecoverButton();

    const dialogOptions = dialogServiceMock.open.mock.calls[0]?.[1] as {
      context: { onConfirm: () => Promise<void> };
    };

    await dialogOptions.context.onConfirm();

    const alert = await harness.getErrorAlert();
    expect(alert).not.toBeNull();
    expect(await alert?.isVisible()).toBe(true);
  });
});
