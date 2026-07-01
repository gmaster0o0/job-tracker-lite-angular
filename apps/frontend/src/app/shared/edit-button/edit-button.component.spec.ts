import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { EditButtonComponent } from './edit-button.component';
import { EditButtonHarness } from './edit-button.harness';

@Component({
  standalone: true,
  imports: [EditButtonComponent],
  template: `
    <app-edit-button
      [disabled]="disabled()"
      [editLabel]="label()"
      (edit)="onEdit()"
    />
  `,
})
class HostComponent {
  disabled = signal(false);
  label = signal('Edit');
  edited = false;

  onEdit() {
    this.edited = true;
  }
}

describe('EditButtonComponent', () => {
  let harness: EditButtonHarness;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, getTranslocoModule()],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      EditButtonHarness,
    );
  });

  it('should render the label', async () => {
    expect(await harness.getLabelText()).toBe('Edit');
  });

  it('should be disabled when input is true', async () => {
    expect(await harness.isDisabled()).toBe(false);

    host.disabled.set(true);
    expect(await harness.isDisabled()).toBe(true);
  });

  it('should emit edit event when button is clicked', async () => {
    await harness.click();
    expect(host.edited).toBe(true);
  });
});
