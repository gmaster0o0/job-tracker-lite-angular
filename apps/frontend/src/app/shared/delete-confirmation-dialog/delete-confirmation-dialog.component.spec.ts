import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import {
  dialogRefMock,
  deleteConfirmationDialogFixtures,
} from '@job-tracker-lite-angular/testing';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog.component';
import { DeleteConfirmationDialogHarness } from './delete-confirmation-dialog.harness';

@Component({
  standalone: true,
  imports: [DeleteConfirmationDialogComponent],
  template: `
    <app-delete-confirmation-dialog (confirm)="onConfirm()">
      <span deleteDialogDescription>Delete this item permanently.</span>
    </app-delete-confirmation-dialog>
  `,
})
class HostComponent {
  confirmCalls = 0;

  onConfirm(): void {
    this.confirmCalls += 1;
  }
}

describe('DeleteConfirmationDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: BrnDialogRef, useValue: dialogRefMock },
        {
          provide: DIALOG_DATA,
          useValue: deleteConfirmationDialogFixtures.default,
        },
      ],
    }).compileComponents();
  });

  it('should render the provided title, description and labels', async () => {
    const fixture = TestBed.createComponent(HostComponent);

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      DeleteConfirmationDialogHarness,
    );

    const text = await harness.getTextContent();

    expect(text).toContain('Remove item?');
    expect(text).toContain('Delete this item permanently.');
    expect(text).toContain('Keep item');
    expect(text).toContain('Delete item');
  });

  it('should emit confirm action', async () => {
    const fixture = TestBed.createComponent(HostComponent);

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      DeleteConfirmationDialogHarness,
    );

    await harness.clickConfirm();
    const host = fixture.componentInstance;
    expect(host.confirmCalls).toBe(1);
  });

  it('should show the busy state when deleting', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: BrnDialogRef, useValue: dialogRefMock },
        {
          provide: DIALOG_DATA,
          useValue: deleteConfirmationDialogFixtures.busy,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      DeleteConfirmationDialogHarness,
    );

    expect(await harness.isConfirmDisabled()).toBe(true);
    expect(await harness.getConfirmLabelText()).toContain('Deleting item...');
  });
});
