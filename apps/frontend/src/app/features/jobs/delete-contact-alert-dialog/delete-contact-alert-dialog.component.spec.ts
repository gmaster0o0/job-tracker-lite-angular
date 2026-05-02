import { TestBed } from '@angular/core/testing';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { DeleteContactAlertDialogComponent } from './delete-contact-alert-dialog.component';

describe('DeleteContactAlertDialogComponent', () => {
  it('should call confirm action', async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteContactAlertDialogComponent],
      providers: [
        {
          provide: BrnDialogRef,
          useValue: {
            close: () => {
              // empty
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DeleteContactAlertDialogComponent);
    const component = fixture.componentInstance as any;

    await component.confirm();

    expect(component.isDeleting()).toBe(false);
  });
});
