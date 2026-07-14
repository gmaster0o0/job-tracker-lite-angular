import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogContext,
} from '@job-tracker-lite-angular/frontend-shared';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { DataManagementComponent } from './data-management.component';

type ExposedDataManagementComponent = {
  isExporting: () => boolean;
  exportUserData: () => Promise<void>;
  openDeleteConfirmation: () => void;
};

describe('DataManagementComponent', () => {
  let fixture: ComponentFixture<DataManagementComponent>;
  let component: DataManagementComponent;
  let exposedComponent: ExposedDataManagementComponent;
  let accountDataAccess: {
    exportUserData: ReturnType<typeof vi.fn>;
    deleteJobApplications: ReturnType<typeof vi.fn>;
  };
  let dialogService: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    accountDataAccess = {
      exportUserData: vi.fn(),
      deleteJobApplications: vi.fn().mockResolvedValue(undefined),
    };
    dialogService = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [DataManagementComponent, getTranslocoModule()],
      providers: [
        { provide: AccountDataAccessService, useValue: accountDataAccess },
        { provide: HlmDialogService, useValue: dialogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataManagementComponent);
    component = fixture.componentInstance;
    exposedComponent = component as unknown as ExposedDataManagementComponent;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('exportUserData', () => {
    let createObjectUrlSpy: ReturnType<typeof vi.fn>;
    let revokeObjectUrlSpy: ReturnType<typeof vi.fn>;
    let anchorClickSpy: ReturnType<typeof vi.fn>;
    let anchorElement: HTMLAnchorElement;

    beforeEach(() => {
      createObjectUrlSpy = vi.fn().mockReturnValue('blob:mock-url');
      revokeObjectUrlSpy = vi.fn();
      window.URL.createObjectURL = createObjectUrlSpy;
      window.URL.revokeObjectURL = revokeObjectUrlSpy;

      anchorElement = document.createElement('a');
      anchorClickSpy = vi.fn();
      vi.spyOn(anchorElement, 'click').mockImplementation(anchorClickSpy);
      vi.spyOn(document, 'createElement').mockReturnValue(anchorElement);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('busy jelzőt állít exportálás közben, majd letölti a fájlt és visszaáll', async () => {
      const exportedBlob = new Blob(['{}'], { type: 'application/json' });
      accountDataAccess.exportUserData.mockResolvedValue(exportedBlob);

      const exportPromise = exposedComponent.exportUserData();
      expect(exposedComponent.isExporting()).toBe(true);

      await exportPromise;

      expect(accountDataAccess.exportUserData).toHaveBeenCalledTimes(1);
      expect(createObjectUrlSpy).toHaveBeenCalledWith(exportedBlob);
      expect(anchorElement.download).toBe('export.json');
      expect(anchorClickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock-url');
      expect(exposedComponent.isExporting()).toBe(false);
    });

    it('hiba esetén is visszaállítja a busy jelzőt', async () => {
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
    function openAndGetContext(): ConfirmationDialogContext<string> {
      exposedComponent.openDeleteConfirmation();

      expect(dialogService.open).toHaveBeenCalledTimes(1);
      const [dialogComponent, options] = dialogService.open.mock.calls[0];
      expect(dialogComponent).toBe(ConfirmationDialogComponent);

      return options.context as ConfirmationDialogContext<string>;
    }

    it('már feloldott title/description/confirm/cancel szöveggel nyitja meg a dialogot', () => {
      const context = openAndGetContext();

      // A `getTranslocoModule()` teszt-stubban feloldatlan kulcsra a
      // kulcsot magát adja vissza, így ez egyben azt is igazolja, hogy
      // a translateSignal ténylegesen lefutott hívás előtt.
      expect(context.title).toBe(
        'privacySettings.datamanagement.deleteJobs.dialog.title',
      );
      expect(context.description).toBe(
        'privacySettings.datamanagement.deleteJobs.dialog.description',
      );
      expect(context.confirmLabel).toBe(
        'privacySettings.datamanagement.deleteJobs.dialog.confirm',
      );
      expect(context.cancelLabel).toBe(
        'privacySettings.datamanagement.deleteJobs.dialog.cancel',
      );
    });

    it('field configot ad át validationSchema-val és a megfelelő szövegekkel', () => {
      const context = openAndGetContext();

      expect(context.field).toBeDefined();
      expect(context.field?.initialValue).toBe('');
      expect(context.field?.validationSchema).toBeDefined();
      expect(context.field?.label).toBe(
        'privacySettings.datamanagement.deleteJobs.dialog.emailLabel',
      );
      expect(context.field?.placeholder).toBe(
        'privacySettings.datamanagement.deleteJobs.dialog.emailPlaceholder',
      );
      expect(context.field?.hint).toBe(
        'privacySettings.datamanagement.deleteJobs.dialog.emailHint',
      );
      expect(context.field?.errorTranslationPrefix).toBe(
        'privacySettings.datamanagement.deleteJobs.dialog',
      );
    });

    it('onConfirm meghívásakor a megadott emaillel törli a job application-öket', async () => {
      const context = openAndGetContext();

      await context.onConfirm?.('user@example.com');

      expect(accountDataAccess.deleteJobApplications).toHaveBeenCalledWith({
        email: 'user@example.com',
      });
    });

    it('nem hív semmilyen törlést, ha onConfirm nincs meghívva', () => {
      openAndGetContext();

      expect(accountDataAccess.deleteJobApplications).not.toHaveBeenCalled();
    });
  });
});
