import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { AccountDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import {
  createBackendError,
  accountDeletionStatusFixtures,
} from '@job-tracker-lite-angular/testing';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { vi } from 'vitest';
import { Router } from '@angular/router';
import { DeletePendingComponent } from './delete-pending.component';
import { DeletePendingHarness } from './delete-pending.harness';

describe('DeletePendingComponent', () => {
  async function setup(statusFixture = accountDeletionStatusFixtures.pending) {
    const accountDataAccessMock = {
      getDeletionStatus: vi.fn().mockResolvedValue(statusFixture),
      recoverAccountDeletion: vi.fn().mockResolvedValue(undefined),
    };

    const dialogServiceMock = {
      open: vi.fn(),
    };

    const routerMock = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [DeletePendingComponent, getTranslocoModule()],
      providers: [
        { provide: AccountDataAccessService, useValue: accountDataAccessMock },
        { provide: HlmDialogService, useValue: dialogServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DeletePendingComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      DeletePendingHarness,
    );

    return {
      fixture,
      harness,
      accountDataAccessMock,
      dialogServiceMock,
      routerMock,
    };
  }

  it('displays countdown when pending', async () => {
    const { fixture, harness } = await setup();

    fixture.detectChanges();

    const text = await harness.getCountdownText();
    expect(text).toContain('d');
    expect(text).toContain('h');
    expect(text).toContain('m');
  });

  it('opens recover dialog and recovers account on confirm', async () => {
    const {
      fixture,
      harness,
      dialogServiceMock,
      accountDataAccessMock,
      routerMock,
    } = await setup();

    await harness.clickRecoverButton();

    expect(dialogServiceMock.open).toHaveBeenCalled();

    const dialogOptions = dialogServiceMock.open.mock.calls[0]?.[1] as {
      context: { onConfirm: () => Promise<void> };
    };

    await dialogOptions.context.onConfirm();
    fixture.detectChanges();

    expect(accountDataAccessMock.recoverAccountDeletion).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/settings/privacy'], {
      queryParams: { accountDeletion: 'recovered' },
    });
  });

  it('shows backend error when recover fails', async () => {
    const { fixture, harness, dialogServiceMock, accountDataAccessMock } =
      await setup();

    accountDataAccessMock.recoverAccountDeletion.mockRejectedValue(
      createBackendError('unknown', 500),
    );

    await harness.clickRecoverButton();

    const dialogOptions = dialogServiceMock.open.mock.calls[0]?.[1] as {
      context: { onConfirm: () => Promise<void> };
    };

    await dialogOptions.context.onConfirm();
    fixture.detectChanges();

    const alert = await harness.getErrorAlert();
    expect(alert).not.toBeNull();
    expect(await alert?.isVisible()).toBe(true);
  });
});
