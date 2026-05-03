import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { dialogRefMock } from '@job-tracker-lite-angular/shared-testing';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog.component';

@Component({
  standalone: true,
  imports: [DeleteConfirmationDialogComponent],
  template: `
    <app-delete-confirmation-dialog
      title="Remove item?"
      confirmLabel="Delete item"
      busyLabel="Deleting item..."
      cancelLabel="Keep item"
      [isBusy]="isBusy"
      (confirm)="onConfirm()"
    >
      <span deleteDialogDescription>Delete this item permanently.</span>
    </app-delete-confirmation-dialog>
  `,
})
class HostComponent {
  isBusy = false;
  confirmCalls = 0;

  onConfirm(): void {
    this.confirmCalls += 1;
  }
}

describe('DeleteConfirmationDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: BrnDialogRef, useValue: dialogRefMock }],
    }).compileComponents();
  });

  it('should render the provided title, description and labels', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.textContent).toContain('Remove item?');
    expect(nativeElement.textContent).toContain(
      'Delete this item permanently.',
    );
    expect(nativeElement.textContent).toContain('Keep item');
    expect(nativeElement.textContent).toContain('Delete item');
  });

  it('should emit confirm action', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons[1].nativeElement.click();
    fixture.detectChanges();

    const host = fixture.componentInstance;
    expect(host.confirmCalls).toBe(1);
  });

  it('should show the busy state when deleting', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.isBusy = true;
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect((buttons[1].nativeElement as HTMLButtonElement).disabled).toBe(true);
    expect(buttons[1].nativeElement.textContent).toContain('Deleting item...');
  });
});
