import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { z } from 'zod';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogContext,
} from './confirmation-dialog.component';
import { ConfirmationDialogHarness } from './confirmation-dialog.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { createBrnDialogRefMock } from '@job-tracker-lite-angular/testing';

type WithBusySignal = {
  effectiveIsBusy: { set: (value: boolean) => void };
};

async function setupComponent(context?: ConfirmationDialogContext): Promise<{
  fixture: ComponentFixture<ConfirmationDialogComponent>;
  component: ConfirmationDialogComponent;
  harness: ConfirmationDialogHarness;
  dialogRefCloseSpy: ReturnType<typeof vi.fn>;
}> {
  const dialogRefCloseSpy = vi.fn();

  await TestBed.configureTestingModule({
    imports: [ConfirmationDialogComponent, getTranslocoModule()],
    providers: [{ provide: BrnDialogRef, useValue: createBrnDialogRefMock() }],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConfirmationDialogComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  const loader: HarnessLoader = TestbedHarnessEnvironment.loader(fixture);
  const harness = await loader.getHarness(ConfirmationDialogHarness);

  return { fixture, component, harness, dialogRefCloseSpy };
}

describe('ConfirmationDialogComponent', () => {
  describe('mező nélküli, sima megerősítés mód (nincs context.field)', () => {
    let fixture: ComponentFixture<ConfirmationDialogComponent>;
    let component: ConfirmationDialogComponent;
    let harness: ConfirmationDialogHarness;
    let dialogRefCloseSpy: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      ({ fixture, component, harness, dialogRefCloseSpy } =
        await setupComponent());
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('a default (translateSignal-lal feloldott) szövegkulcsokat jeleníti meg, ha nincs context override', () => {
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('shared.confirmationDialog.title');
      expect(text).toContain('shared.confirmationDialog.description');
      expect(text).toContain('shared.confirmationDialog.confirm');
    });

    it('nem jelenít meg input mezőt', async () => {
      expect(await harness.hasField()).toBe(false);
    });

    it('a submit gomb induláskor engedélyezett, mező hiányában', async () => {
      expect(await harness.isSubmitDisabled()).toBe(false);
    });

    it('submitra rögtön megerősít és bezárja a dialogot, adat nélkül', async () => {
      const confirmSpy = vi.fn();
      component.confirm.subscribe(confirmSpy);

      await harness.clickSubmit();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(confirmSpy).toHaveBeenCalled();
      expect(dialogRefCloseSpy).toHaveBeenCalled();
    });

    it('cancel-re bezárja a dialogot megerősítés nélkül', async () => {
      const confirmSpy = vi.fn();
      component.confirm.subscribe(confirmSpy);

      await harness.clickCancel();

      expect(dialogRefCloseSpy).toHaveBeenCalled();
      expect(confirmSpy).not.toHaveBeenCalled();
    });
  });

  describe('context felülírja a default szövegeket', () => {
    it('a context-ből kapott, már feloldott stringeket jeleníti meg a defaultok helyett', () => {
      return setupComponent({
        title: 'Törlés megerősítése',
        description: 'Írd be az emailedet a törléshez.',
        confirmLabel: 'Törlöm',
        cancelLabel: 'Mégse',
      }).then(({ fixture }) => {
        const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
        expect(text).toContain('Törlés megerősítése');
        expect(text).toContain('Írd be az emailedet a törléshez.');
        expect(text).toContain('Törlöm');
        expect(text).not.toContain('shared.confirmationDialog.title');
      });
    });
  });

  describe('mezővel és külső sémával konfigurált mód (pl. delete-job-applications use case)', () => {
    // Ezt a sémát a hívó fél állítja elő — ő tudja, mihez kell
    // "matchelnie" a beírt értéknek. A komponens csak lefuttatja.
    const expectedEmail = 'user@example.com';
    const matchEmailSchema = z
      .string()
      .min(1, { message: 'settings.data_management.deleteJobs.email_required' })
      .email({ message: 'settings.data_management.deleteJobs.email_invalid' })
      .refine((value) => value === expectedEmail, {
        message: 'settings.data_management.deleteJobs.email_mismatch',
      });

    function contextWithField(
      overrides: Partial<ConfirmationDialogContext> = {},
    ): ConfirmationDialogContext {
      return {
        title: 'Job jelentkezések törlése',
        description: 'Erősítsd meg az emailed beírásával.',
        field: {
          initialValue: '',
          validationSchema: matchEmailSchema,
          label: 'Email',
          errorTranslationPrefix: 'settings.data_management.deleteJobs',
        },
        ...overrides,
      };
    }

    it('mezőt jelenít meg, ha van field config', async () => {
      const { harness } = await setupComponent(contextWithField());
      expect(await harness.hasField()).toBe(true);
    });

    it('a submit gomb tiltott, amíg a mező nem valid', async () => {
      const { harness } = await setupComponent(contextWithField());
      expect(await harness.isSubmitDisabled()).toBe(true);
    });

    it('tiltva marad, ha a beírt érték nem egyezik az elvárt értékkel', async () => {
      const { fixture, harness } = await setupComponent(contextWithField());

      await harness.setValue('not-the-right-email@example.com');
      fixture.detectChanges();

      expect(await harness.isSubmitDisabled()).toBe(true);
    });

    it('engedélyezi a submitot, ha a beírt érték illeszkedik a sémára', async () => {
      const { fixture, harness } = await setupComponent(contextWithField());

      await harness.setValue(expectedEmail);
      fixture.detectChanges();

      expect(await harness.isSubmitDisabled()).toBe(false);
    });

    it('a megfelelő érték megadása után a confirm eventtel adja át az értéket', async () => {
      const { fixture, component, harness, dialogRefCloseSpy } =
        await setupComponent(contextWithField());
      const confirmSpy = vi.fn();
      component.confirm.subscribe(confirmSpy);

      await harness.setValue(expectedEmail);
      fixture.detectChanges();

      await harness.clickSubmit();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(confirmSpy).toHaveBeenCalledWith(expectedEmail);
      expect(dialogRefCloseSpy).toHaveBeenCalled();
    });
  });

  describe('busy state', () => {
    it('a submit gombot letiltja és a busy labelt mutatja submit közben', async () => {
      const { fixture, component, harness } = await setupComponent();

      (component as unknown as WithBusySignal).effectiveIsBusy.set(true);
      fixture.detectChanges();

      expect(await harness.isSubmitDisabled()).toBe(true);
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('shared.confirmationDialog.busy');
    });
  });
});
