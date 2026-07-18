import { createNotificationServiceMock } from '@job-tracker-lite-angular/testing';
import { NotificationService } from '@job-tracker-lite-angular/frontend-data-access';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { AccountDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { createBackendError } from '@job-tracker-lite-angular/testing';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { vi } from 'vitest';
import { DeleteAccountComponent } from './delete-account.component';
import { DeleteAccountHarness } from './delete-account.harness';

describe('DeleteAccountComponent', () => {
  async function setup() {
    const accountDataAccessMock = {
      requestAccountDeletion: vi.fn().mockResolvedValue(undefined),
    };

    const dialogServiceMock = {
      open: vi.fn(),
    };
    const notificationMock = createNotificationServiceMock();
    vi.spyOn(notificationMock, 'success');

    await TestBed.configureTestingModule({
      imports: [DeleteAccountComponent, getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useValue: notificationMock,
        },
        {
          provide: AccountDataAccessService,
          useValue: accountDataAccessMock,
        },
        {
          provide: HlmDialogService,
          useValue: dialogServiceMock,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DeleteAccountComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      DeleteAccountHarness,
    );

    return {
      fixture,
      harness,
      accountDataAccessMock,
      dialogServiceMock,
      notificationMock,
    };
  }

  it('opens a confirmation dialog when delete button is clicked', async () => {
    const { harness, dialogServiceMock } = await setup();

    await harness.clickDeleteButton();

    expect(dialogServiceMock.open).toHaveBeenCalled();
  });

  it('shows confirmation info after successful deletion request', async () => {
    const {
      harness,
      accountDataAccessMock,
      dialogServiceMock,
      notificationMock,
    } = await setup();

    await harness.clickDeleteButton();

    const dialogOptions = dialogServiceMock.open.mock.calls[0]?.[1] as {
      context: {
        onConfirm: () => Promise<void>;
      };
    };

    await dialogOptions.context.onConfirm();

    expect(accountDataAccessMock.requestAccountDeletion).toHaveBeenCalledWith({
      language: 'en',
    });
    expect(await harness.getSuccessText()).toContain(
      'A confirmation email has been sent',
    );
    expect(notificationMock.success).toHaveBeenCalledTimes(1);
    expect(notificationMock.success).toHaveBeenCalledWith(
      'Account deletion request successful.',
    );
  });

  it('shows backend error when deletion request fails', async () => {
    const { harness, accountDataAccessMock, dialogServiceMock } = await setup();

    accountDataAccessMock.requestAccountDeletion.mockRejectedValue(
      createBackendError('unknown', 500),
    );

    await harness.clickDeleteButton();

    const dialogOptions = dialogServiceMock.open.mock.calls[0]?.[1] as {
      context: {
        onConfirm: () => Promise<void>;
      };
    };

    await dialogOptions.context.onConfirm();

    const alert = await harness.getErrorAlert();
    expect(alert).not.toBeNull();
    expect(await alert?.isVisible()).toBe(true);
  });
});
