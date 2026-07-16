import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { CleanupPeriodPickerComponent } from './cleanup-period-picker.component';
import { CleanupPeriodPickerHarness } from './cleanup-period-picker.harness';

describe('CleanupPeriodPickerComponent', () => {
  let component: CleanupPeriodPickerComponent;
  let fixture: ComponentFixture<CleanupPeriodPickerComponent>;
  let harness: CleanupPeriodPickerHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CleanupPeriodPickerComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(CleanupPeriodPickerComponent);
    component = fixture.componentInstance;

    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CleanupPeriodPickerHarness,
    );
  });

  /** Helper function: sets the slider signal value directly and runs change detection. */
  function setSliderValue(value: number): void {
    component.filterForm.period().value.set([value]);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default state', () => {
    it('should default to 6 months (10) slider value', () => {
      expect(component.filterForm.period().value()).toEqual([10]);
    });

    it('should render the submit button', async () => {
      const text = await harness.getSubmitButtonText();
      expect(text.length).toBeGreaterThan(0);
    });

    it('should render a non-empty explanation text for the default value', async () => {
      const explanation = await harness.getExplanationText();
      expect(explanation.length).toBeGreaterThan(0);
    });
  });

  describe('sliderColorClass', () => {
    it.each([
      [0, 'slider-green'],
      [10, 'slider-green'],
      [20, 'slider-yellow'],
      [30, 'slider-yellow'],
      [40, 'slider-red'],
      [50, 'slider-red'],
    ])('should resolve %i to %s', (value, expectedClass) => {
      setSliderValue(value);
      expect(component.sliderColorClass()).toBe(expectedClass);
    });

    // Note: We do not test explicit `undefined` values via filterForm.period()
    // because the Signal Forms FieldTree builds the array-based field structure
    // from the current value, and setting `undefined` puts the internal proxy
    // into an inconsistent state (this is also unreachable via the UI, as the
    // slider always emits number[]).

    it('should reflect the color class on the rendered slider element', async () => {
      setSliderValue(40);
      const colorClass = await harness.getSliderColorClass();
      expect(colorClass).toBe('slider-red');
    });
  });

  describe('explanationText', () => {
    it('should update when the slider value changes', async () => {
      const initialExplanation = await harness.getExplanationText();

      setSliderValue(50);
      const updatedExplanation = await harness.getExplanationText();

      expect(updatedExplanation).not.toBe(initialExplanation);
    });

    it('should fall back to an empty string for an unknown value', async () => {
      setSliderValue(999);
      const explanation = await harness.getExplanationText();
      expect(explanation).toBe('');
    });
  });

  describe('formatTick', () => {
    it('should return the tick label for a known value', () => {
      // Every entry in textObject has a translateSignal-based tick,
      // which returns a non-empty string after the translation key loads.
      expect(typeof component.formatTick(0)).toBe('string');
      expect(typeof component.formatTick(50)).toBe('string');
    });

    it('should return an empty string for an unknown tick value', () => {
      expect(component.formatTick(999)).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('should emit a date ~12 months in the past for value 0 (1 year)', async () => {
      const emitSpy = vi.fn();
      component.cleanupRequested.subscribe(emitSpy);

      setSliderValue(0);
      await harness.clickSubmit();

      expect(emitSpy).toHaveBeenCalledTimes(1);
      const emitted: Date = emitSpy.mock.calls[0][0];
      const expected = new Date();
      expected.setMonth(expected.getMonth() - 12);
      expect(emitted.getFullYear()).toBe(expected.getFullYear());
      expect(emitted.getMonth()).toBe(expected.getMonth());
    });

    it('should emit a date ~6 months in the past for the default value (10)', async () => {
      const emitSpy = vi.fn();
      component.cleanupRequested.subscribe(emitSpy);

      await harness.clickSubmit();

      const emitted: Date = emitSpy.mock.calls[0][0];
      const expected = new Date();
      expected.setMonth(expected.getMonth() - 6);
      expect(emitted.getFullYear()).toBe(expected.getFullYear());
      expect(emitted.getMonth()).toBe(expected.getMonth());
    });

    it('should emit a date ~14 days in the past for value 40 (2 weeks)', async () => {
      const emitSpy = vi.fn();
      component.cleanupRequested.subscribe(emitSpy);

      setSliderValue(40);
      await harness.clickSubmit();

      const emitted: Date = emitSpy.mock.calls[0][0];
      const expected = new Date();
      expected.setDate(expected.getDate() - 14);
      expect(emitted.getFullYear()).toBe(expected.getFullYear());
      expect(emitted.getMonth()).toBe(expected.getMonth());
      expect(emitted.getDate()).toBe(expected.getDate());
    });

    it('should emit (roughly) the current date for value 50 (all)', async () => {
      const emitSpy = vi.fn();
      component.cleanupRequested.subscribe(emitSpy);

      setSliderValue(50);
      await harness.clickSubmit();

      const emitted: Date = emitSpy.mock.calls[0][0];
      const now = new Date();
      expect(Math.abs(emitted.getTime() - now.getTime())).toBeLessThan(5000);
    });

    it('should fall back to the ~12 months case for an unexpected raw value', async () => {
      const emitSpy = vi.fn();
      component.cleanupRequested.subscribe(emitSpy);

      // Write a non-standard value directly into the model to cover
      // the switch-default branch.
      component.filterForm.period().value.set([999]);

      await harness.clickSubmit();

      const emitted: Date = emitSpy.mock.calls[0][0];
      const expected = new Date();
      expected.setMonth(expected.getMonth() - 12);
      expect(emitted.getFullYear()).toBe(expected.getFullYear());
      expect(emitted.getMonth()).toBe(expected.getMonth());
    });

    it('should not navigate away / reload the page on submit (preventDefault called)', async () => {
      const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
      const submitEvent = new Event('submit', { cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('slider interaction via DOM', () => {
    it('should expose the configured min/max bounds on the rendered slider', async () => {
      const bounds = await harness.getSliderBounds();
      expect(bounds.min).toBe(0);
      expect(bounds.max).toBe(50);
    });

    it('should reflect the current form value as aria-valuenow', async () => {
      setSliderValue(30);
      const value = await harness.getSliderValue();
      expect(value).toBe(30);
    });
  });
});
