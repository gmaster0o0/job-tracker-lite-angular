import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthSessionService } from '../services/auth-session.service';
import { HasRoleDirective } from './has-role.directive';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAuthSessionServiceMock } from '@job-tracker-lite-angular/testing';

@Component({
  standalone: true,
  imports: [HasRoleDirective],
  template: `<span *libHasRole="roles">Protected content</span>`,
})
class TestHostComponent {
  roles: string[] = ['ADMIN'];
}

describe('HasRoleDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let authSessionServiceMock: ReturnType<typeof createAuthSessionServiceMock>;

  beforeEach(async () => {
    authSessionServiceMock = createAuthSessionServiceMock(() => vi.fn());

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        {
          provide: AuthSessionService,
          useValue: authSessionServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should render content for allowed roles', () => {
    authSessionServiceMock.role.mockReturnValue('ADMIN');

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Protected content');
  });

  it('should hide content for disallowed roles', () => {
    authSessionServiceMock.role.mockReturnValue('USER');

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain(
      'Protected content',
    );
  });
});
