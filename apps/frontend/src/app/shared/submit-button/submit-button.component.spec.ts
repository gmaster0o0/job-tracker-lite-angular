import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SubmitButtonComponent } from './submit-button.component';
import { SubmitButtonHarness } from './submit-button.harness';

@Component({
  standalone: true,
  imports: [SubmitButtonComponent],
  template: `
    <app-submit-button
      formId="jobForm"
      [disabled]="disabled"
      [isSubmitting]="isSubmitting"
      [idleIcon]="idleIcon"
      [cooldownUntil]="cooldownUntil"
      [cooldownLabel]="cooldownLabel"
      [cooldownTooltip]="cooldownTooltip"
      idleLabel="Create"
      submittingLabel="Saving..."
    />
  `,
})
class HostComponent {
  disabled = false;
  isSubmitting = false;
  idleIcon = 'lucideSave';
  cooldownUntil: Date | null = null;
  cooldownLabel: ((remainingSeconds: number) => string) | null = null;
  cooldownTooltip: string | null = null;
}

describe('SubmitButtonComponent', () => {
  let harness: SubmitButtonHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SubmitButtonHarness,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render idle label when not submitting', async () => {
    expect(await harness.getLabelText()).toContain('Create');
    expect(await harness.isDisabled()).toBe(false);
    expect(await harness.getFormId()).toBe('jobForm');
  });

  it('should render a different icon when idleIcon is overridden', async () => {
    const defaultIconMarkup = await harness.getIdleIconMarkup();
    expect(defaultIconMarkup).not.toBe('');

    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.idleIcon = 'lucideRefreshCw';
    const localHarness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SubmitButtonHarness,
    );

    expect(await localHarness.getIdleIconMarkup()).not.toBe(defaultIconMarkup);
  });

  it('should render submitting label and disable button while submitting', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.isSubmitting = true;
    const localHarness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SubmitButtonHarness,
    );

    expect(await localHarness.getLabelText()).toContain('Saving...');
    expect(await localHarness.isDisabled()).toBe(true);
    expect(await localHarness.isSubmittingStateVisible()).toBe(true);
  });

  it('should disable the button and show the cooldown label while cooldownUntil is in the future', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.cooldownUntil = new Date(
      '2026-01-01T00:00:30.000Z',
    );
    fixture.componentInstance.cooldownLabel = (seconds) => `Wait (${seconds}s)`;
    const localHarness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SubmitButtonHarness,
    );

    expect(await localHarness.isDisabled()).toBe(true);
    expect(await localHarness.getLabelText()).toContain('Wait (30s)');
  });

  it('should count down the cooldown label and re-enable once it elapses', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.cooldownUntil = new Date(
      '2026-01-01T00:00:02.000Z',
    );
    fixture.componentInstance.cooldownLabel = (seconds) => `Wait (${seconds}s)`;
    const localHarness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SubmitButtonHarness,
    );

    expect(await localHarness.getLabelText()).toContain('Wait (2s)');

    await vi.advanceTimersByTimeAsync(1000);
    expect(await localHarness.getLabelText()).toContain('Wait (1s)');

    await vi.advanceTimersByTimeAsync(1000);
    expect(await localHarness.isDisabled()).toBe(false);
    expect(await localHarness.getLabelText()).toContain('Create');
  });

  it('should fall back to the idle label when no cooldownLabel is provided', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.cooldownUntil = new Date(
      '2026-01-01T00:00:30.000Z',
    );
    const localHarness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SubmitButtonHarness,
    );

    expect(await localHarness.isDisabled()).toBe(true);
    expect(await localHarness.getLabelText()).toContain('Create');
  });

  it('should stay enabled when cooldownUntil is null', async () => {
    expect(await harness.isDisabled()).toBe(false);
  });
});
