import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { z } from 'zod';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogContext,
} from './confirmation-dialog.component';
import { ConfirmationDialogHarness } from './confirmation-dialog.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { createBrnDialogRefMock } from '@job-tracker-lite-angular/testing';
describe('ConfirmationDialogComponent', () => {
  let dialogRefMock: ReturnType<typeof createBrnDialogRefMock>;

  async function configureTestEnvironment(
    contextOverride?: ConfirmationDialogContext,
  ) {
    dialogRefMock = createBrnDialogRefMock();

    const providers = [
      { provide: BrnDialogRef, useValue: dialogRefMock },
      {
        provide: DIALOG_DATA,
        useValue: contextOverride ?? {},
      },
    ];

    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent, getTranslocoModule()],
      providers,
    }).compileComponents();
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });
  describe('Basic confirmation dialog (no context.field)', () => {
    let fixture: ComponentFixture<ConfirmationDialogComponent>;
    let component: ConfirmationDialogComponent;
    let harness: ConfirmationDialogHarness;
    beforeEach(async () => {
      await configureTestEnvironment();
      fixture = TestBed.createComponent(ConfirmationDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      harness = await TestbedHarnessEnvironment.harnessForFixture(
        fixture,
        ConfirmationDialogHarness,
      );
    });
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('displays default (translateSignal-resolved) text keys when no context override is provided', async () => {
      expect(await harness.getTitleText()).toContain(
        'shared.confirmationDialog.title',
      );
      expect(await harness.getDescriptionText()).toContain(
        'shared.confirmationDialog.description',
      );
    });

    it('does not display an input field', async () => {
      expect(await harness.hasField()).toBe(false);
    });

    it('submit button is enabled initially, without a field', async () => {
      expect(await harness.isSubmitDisabled()).toBe(false);
    });

    it('on submit, immediately confirms and closes the dialog, without data', async () => {
      const confirmSpy = vi.fn();
      component.confirm.subscribe(confirmSpy);
      const closeSpy = vi.spyOn(dialogRefMock, 'close');
      await harness.clickSubmit();

      expect(confirmSpy).toHaveBeenCalled();
      expect(closeSpy).toHaveBeenCalled();
    });

    it('on cancel, closes the dialog without confirming', async () => {
      const confirmSpy = vi.fn();
      component.confirm.subscribe(confirmSpy);
      const closeSpy = vi.spyOn(dialogRefMock, 'close');
      await harness.clickCancel();

      expect(closeSpy).toHaveBeenCalled();
      expect(confirmSpy).not.toHaveBeenCalled();
    });
  });

  describe('context overrides default texts', () => {
    it('displays the resolved strings from the context instead of the defaults', async () => {
      const context: ConfirmationDialogContext = {
        title: 'Törlés megerősítése',
        description: 'Írd be az emailedet a törléshez.',
        confirmLabel: 'Törlöm',
        cancelLabel: 'Mégse',
      };

      await configureTestEnvironment(context);

      const fixture = TestBed.createComponent(ConfirmationDialogComponent);
      fixture.detectChanges();

      const harness = await TestbedHarnessEnvironment.harnessForFixture(
        fixture,
        ConfirmationDialogHarness,
      );

      expect(await harness.getTitleText()).toBe('Törlés megerősítése');
      expect(await harness.getDescriptionText()).toBe(
        'Írd be az emailedet a törléshez.',
      );
    });
  });

  describe('configured with a field and external schema', () => {
    const expectedEmail = 'user@example.com';
    const matchEmailSchema = z.string().refine((val) => val === expectedEmail);
    let context: ConfirmationDialogContext;

    beforeEach(() => {
      context = {
        title: 'Job jelentkezések törlése',
        field: {
          initialValue: '',
          validationSchema: matchEmailSchema,
          label: 'Email',
        },
      };
    });

    it('displays a field if field config is provided', async () => {
      await configureTestEnvironment(context);
      const fixture = TestBed.createComponent(ConfirmationDialogComponent);
      fixture.detectChanges();

      const harness = await TestbedHarnessEnvironment.harnessForFixture(
        fixture,
        ConfirmationDialogHarness,
      );

      expect(await harness.hasField()).toBe(true);
    });

    it('submit button is disabled until the field is valid', async () => {
      await configureTestEnvironment(context);
      const fixture = TestBed.createComponent(ConfirmationDialogComponent);
      fixture.detectChanges();

      const harness = await TestbedHarnessEnvironment.harnessForFixture(
        fixture,
        ConfirmationDialogHarness,
      );

      expect(await harness.isSubmitDisabled()).toBe(true);
    });

    it('enables the submit button if the entered value matches the schema', async () => {
      await configureTestEnvironment(context);
      const fixture = TestBed.createComponent(ConfirmationDialogComponent);
      fixture.detectChanges();

      const harness = await TestbedHarnessEnvironment.harnessForFixture(
        fixture,
        ConfirmationDialogHarness,
      );

      await harness.setValue(expectedEmail);
      fixture.detectChanges();

      expect(await harness.isSubmitDisabled()).toBe(false);
    });
  });

  describe('busy state', () => {
    it('disables the submit button and shows the busy label while submitting', async () => {
      const context: ConfirmationDialogContext = {
        isBusy: true,
        busyLabel: 'Folyamatban...',
      };

      await configureTestEnvironment(context);

      const fixture = TestBed.createComponent(ConfirmationDialogComponent);
      fixture.detectChanges();

      const harness = await TestbedHarnessEnvironment.harnessForFixture(
        fixture,
        ConfirmationDialogHarness,
      );

      expect(await harness.isSubmitDisabled()).toBe(true);
      expect(await harness.getSubmitButtonText()).toBe('Folyamatban...');
    });
  });
});
