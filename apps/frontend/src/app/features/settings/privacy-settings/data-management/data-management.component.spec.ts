import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AccountDataAccessService,
  AuthSessionService,
} from '@job-tracker-lite-angular/frontend-data-access';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogContext,
} from '@job-tracker-lite-angular/frontend-shared';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { DataManagementComponent } from './data-management.component';
import {
  createAccountDataAccessMock,
  createAuthSessionServiceMock,
  exportDataFixtures,
} from '@job-tracker-lite-angular/testing';

type ExposedDataManagementComponent = {
  isExporting: () => boolean;
  exportUserData: () => Promise<void>;
  openDeleteConfirmation: () => void;
};

describe('DataManagementComponent', () => {
  let fixture: ComponentFixture<DataManagementComponent>;
  let component: DataManagementComponent;
  let exposedComponent: ExposedDataManagementComponent;
  let accountDataAccess: ReturnType<typeof createAccountDataAccessMock>;
  let dialogService: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    accountDataAccess = createAccountDataAccessMock({}, vi.fn);
    const authSessionMock = createAuthSessionServiceMock(vi.fn);
    dialogService = { open: vi.fn() };

    accountDataAccess.exportUserData = vi.fn(accountDataAccess.exportUserData);
    accountDataAccess.deleteJobApplications = vi.fn(
      accountDataAccess.deleteJobApplications,
    );
    await TestBed.configureTestingModule({
      imports: [DataManagementComponent, getTranslocoModule()],
      providers: [
        { provide: AccountDataAccessService, useValue: accountDataAccess },
        { provide: AuthSessionService, useValue: authSessionMock },
        { provide: HlmDialogService, useValue: dialogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataManagementComponent);
    component = fixture.componentInstance;
    exposedComponent = component as unknown as ExposedDataManagementComponent;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('exportUserData', () => {
    let createObjectUrlSpy: ReturnType<typeof vi.fn>;
    let revokeObjectUrlSpy: ReturnType<typeof vi.fn>;
    let anchorClickSpy: ReturnType<typeof vi.spyOn>;
    let anchorElement: HTMLAnchorElement;

    beforeEach(() => {
      createObjectUrlSpy = vi
        .spyOn(URL, 'createObjectURL')
        .mockReturnValue('blob:mock-url');
      revokeObjectUrlSpy = vi
        .spyOn(URL, 'revokeObjectURL')
        .mockImplementation(() => {
          //empty
        });

      anchorElement = document.createElement('a');
      anchorClickSpy = vi
        .spyOn(anchorElement, 'click')
        .mockImplementation(() => {
          //empty
        });
      vi.spyOn(document, 'createElement').mockReturnValue(anchorElement);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('sets the busy indicator during export and downloads the file', async () => {
      const fakeDate = new Date(exportDataFixtures.fakeDateString);
      vi.useFakeTimers();
      vi.setSystemTime(fakeDate);

      const exportedBlob = new Blob(['{}'], { type: 'application/json' });
      accountDataAccess.exportUserData.mockResolvedValue(exportedBlob);

      const exportPromise = exposedComponent.exportUserData();
      expect(exposedComponent.isExporting()).toBe(true);

      await exportPromise;

      expect(accountDataAccess.exportUserData).toHaveBeenCalledTimes(1);
      expect(createObjectUrlSpy).toHaveBeenCalledWith(exportedBlob);
      expect(anchorElement.download).toBe(exportDataFixtures.testFileName);
      expect(anchorClickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock-url');
      expect(exposedComponent.isExporting()).toBe(false);
    });

    it('resets the busy indicator even if an error occurs', async () => {
      const exportError = new Error('export failed');
      accountDataAccess.exportUserData.mockRejectedValue(exportError);

      await expect(exposedComponent.exportUserData()).rejects.toThrow(
        exportError,
      );

      expect(exposedComponent.isExporting()).toBe(false);
      expect(anchorClickSpy).not.toHaveBeenCalled();
    });
  });

  describe('openDeleteConfirmation', () => {
    function openAndGetContext(): ConfirmationDialogContext {
      exposedComponent.openDeleteConfirmation();

      expect(dialogService.open).toHaveBeenCalledTimes(1);
      const [dialogComponent, options] = dialogService.open.mock.calls[0];
      expect(dialogComponent).toBe(ConfirmationDialogComponent);

      return options.context as ConfirmationDialogContext;
    }

    it('displays the resolved strings from the context instead of the defaults', () => {
      const context = openAndGetContext();

      expect(context.title).toBe('Confirm Deletion of Job Applications');
      expect(context.description).toBe(
        '{mode, select, all {All of your job applications will be permanently deleted.} other {The job applications from before {date} will be permanently deleted.}} This action is permanent and cannot be undone.',
      );
      expect(context.confirmLabel).toBe('Delete Job Applications');
      expect(context.cancelLabel).toBe('Cancel');
    });

    it('passes field config with validationSchema and appropriate texts', () => {
      const context = openAndGetContext();

      expect(context.field).toBeDefined();
      expect(context.field?.initialValue).toBe('');
      expect(context.field?.validationSchema).toBeDefined();
      expect(context.field?.label).toBe('Email');
      expect(context.field?.placeholder).toBe('example@email.com');
      expect(context.field?.hint).toBe(
        'Please enter your email address to confirm.',
      );
      expect(context.field?.errorTranslationPrefix).toBe(
        'privacySettings.datamanagement.deleteJobs.dialog',
      );
    });

    it('calls deleteJobApplications with the provided email when onConfirm is called', async () => {
      const context = openAndGetContext();

      await context.onConfirm?.('user@example.com');

      expect(accountDataAccess.deleteJobApplications).toHaveBeenCalledWith({
        email: 'user@example.com',
      });
    });

    it('Should not call deleteJobApplications if onConfirm is not called', () => {
      openAndGetContext();

      expect(accountDataAccess.deleteJobApplications).not.toHaveBeenCalled();
    });
  });
});
