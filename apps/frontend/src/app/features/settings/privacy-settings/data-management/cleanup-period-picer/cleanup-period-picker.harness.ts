import {
  ComponentHarness,
  HarnessPredicate,
  TestKey,
} from '@angular/cdk/testing';

/**
 * Harness for the CleanupPeriodPickerComponent testing.
 *
 * Elements controlled by our own template (slider host, explanation text,
 * submit button) are identified via the `data-testid` attribute — see
 * cleanup-period-picker.component.html. This is independent of Tailwind
 * classes and the internal implementation of hlmXxx directives.
 *
 * The slider's internal "thumb" element, however, is rendered by the
 * `hlm-slider` (@spartan-ng/brain/slider) headless library. We cannot
 * place our own `data-testid` there, so we rely on the ARIA `role="slider"`
 * attribute, restricting the search to the root marked with data-testid.
 * If a different version of the library changes the DOM structure, only
 * the `_thumb` locator needs to be modified; the public API will remain
 * unchanged.
 */
export class CleanupPeriodPickerHarness extends ComponentHarness {
  static hostSelector = 'app-cleanup-period-picker';

  static with(
    options: Record<string, never> = {},
  ): HarnessPredicate<CleanupPeriodPickerHarness> {
    return new HarnessPredicate(CleanupPeriodPickerHarness, options);
  }

  private readonly _sliderRoot = this.locatorFor(
    '[data-testid="cleanup-period-slider"]',
  );
  private readonly _thumb = this.locatorFor(
    '[data-testid="cleanup-period-slider"] [role="slider"]',
  );
  private readonly _description = this.locatorFor(
    '[data-testid="cleanup-period-explanation"]',
  );
  private readonly _submitButton = this.locatorFor(
    '[data-testid="cleanup-period-submit"]',
  );

  /** Get the label text of the submit button. */
  async getSubmitButtonText(): Promise<string> {
    const button = await this._submitButton();
    return (await button.text()).trim();
  }

  /** Click the submit button. */
  async clickSubmit(): Promise<void> {
    const button = await this._submitButton();
    await button.click();
  }

  /** The disabled state of the submit button. */
  async isSubmitDisabled(): Promise<boolean> {
    const button = await this._submitButton();
    return (await button.getProperty<boolean>('disabled')) ?? false;
  }

  /** Read the explanation text (hlmFieldDescription). */
  async getExplanationText(): Promise<string> {
    const description = await this._description();
    return (await description.text()).trim();
  }

  /** The current value of the slider based on the aria-valuenow attribute. */
  async getSliderValue(): Promise<number | null> {
    const thumb = await this._thumb();
    const raw = await thumb.getAttribute('aria-valuenow');
    return raw === null ? null : Number(raw);
  }

  /** The min/max bounds of the slider. */
  async getSliderBounds(): Promise<{ min: number | null; max: number | null }> {
    const thumb = await this._thumb();
    const min = await thumb.getAttribute('aria-valuemin');
    const max = await thumb.getAttribute('aria-valuemax');
    return {
      min: min === null ? null : Number(min),
      max: max === null ? null : Number(max),
    };
  }

  /**
   * Read the slider's color class (slider-green / slider-yellow / slider-red)
   * from the root element's class attribute.
   */
  async getSliderColorClass(): Promise<string | null> {
    const root = await this._sliderRoot();
    const classAttr = (await root.getAttribute('class')) ?? '';
    const match = classAttr.match(/slider-(green|yellow|red)/);
    return match ? match[0] : null;
  }

  /** Focus the slider. */
  async focusSlider(): Promise<void> {
    const thumb = await this._thumb();
    await thumb.focus();
  }

  /**
   * Increase/decrease the slider value using the keyboard (right/left arrows).
   * The thumb must be in focus for this, and the component must handle key
   * events (this is typically default behavior for Radix-style sliders).
   */
  async increaseSlider(times = 1): Promise<void> {
    const thumb = await this._thumb();
    await thumb.focus();
    for (let i = 0; i < times; i++) {
      await thumb.sendKeys(TestKey.RIGHT_ARROW);
    }
  }

  async decreaseSlider(times = 1): Promise<void> {
    const thumb = await this._thumb();
    await thumb.focus();
    for (let i = 0; i < times; i++) {
      await thumb.sendKeys(TestKey.LEFT_ARROW);
    }
  }

  private readonly _tickLabels = this.locatorForAll(
    '[data-testid="cleanup-period-slider"] [data-tick-label], ' +
      '[data-testid="cleanup-period-slider"] .slider-tick-label',
  );

  /** Read the text of all tick labels (if rendered). */
  async getTickLabels(): Promise<string[]> {
    const ticks = await this._tickLabels();
    return Promise.all(ticks.map((tick) => tick.text()));
  }
}
