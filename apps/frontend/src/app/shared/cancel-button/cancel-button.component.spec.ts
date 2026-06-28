import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CancelButtonComponent } from './cancel-button.component';
import { CancelButtonHarness } from './cancel-button.harness';

@Component({
  standalone: true,
  imports: [CancelButtonComponent],
  template: `
    <app-cancel-button
      [disabled]="disabled()"
      [cancelLabel]="label()"
      (clicked)="onClicked()"
    />
  `,
})
class HostComponent {
  disabled = signal(false);
  label = signal('Cancel');
  clicked = false;

  onClicked() {
    this.clicked = true;
  }
}

describe('CancelButtonComponent', () => {
  let harness: CancelButtonHarness;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CancelButtonHarness,
    );
  });

  it('should render the label', async () => {
    expect(await harness.getLabelText()).toBe('Cancel');
  });

  it('should be disabled when input is true', async () => {
    expect(await harness.isDisabled()).toBe(false);

    host.disabled.set(true);
    expect(await harness.isDisabled()).toBe(true);
  });

  it('should emit clicked event when button is clicked', async () => {
    await harness.click();
    expect(host.clicked).toBe(true);
  });
});
