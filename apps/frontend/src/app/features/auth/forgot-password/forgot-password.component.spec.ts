import { TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { describe, it, expect } from 'vitest';

describe('ForgotPasswordComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
