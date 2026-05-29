import { TestBed } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { describe, it, expect } from 'vitest';

describe('ResetPasswordComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
