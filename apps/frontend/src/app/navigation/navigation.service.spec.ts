import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
import { createAuthSessionServiceMock } from '@job-tracker-lite-angular/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MenuItem, NavigationService } from './navigation.service';

describe('NavigationService', () => {
  let service: NavigationService;
  let router: { url: string; navigateByUrl: ReturnType<typeof vi.fn> };

  function setup(isAuthenticated: boolean) {
    TestBed.resetTestingModule();

    const authSessionMock = createAuthSessionServiceMock(() => vi.fn());
    authSessionMock.isAuthenticated = signal(isAuthenticated);

    router = { url: '/', navigateByUrl: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthSessionService, useValue: authSessionMock },
        { provide: Router, useValue: router },
        { provide: Location, useValue: {} },
      ],
    });

    service = TestBed.inject(NavigationService);
  }

  function menuItem(overrides: Partial<MenuItem> = {}): MenuItem {
    return {
      label: signal('Item'),
      icon: 'icon',
      path: '/item',
      ...overrides,
    };
  }

  describe('isItemVisible', () => {
    it('is visible when it has no auth restrictions', () => {
      setup(false);
      expect(service.isItemVisible(menuItem())).toBe(true);

      setup(true);
      expect(service.isItemVisible(menuItem())).toBe(true);
    });

    it('hides items that require auth when guest', () => {
      setup(false);
      expect(service.isItemVisible(menuItem({ requiresAuth: true }))).toBe(
        false,
      );
    });

    it('shows items that require auth when authenticated', () => {
      setup(true);
      expect(service.isItemVisible(menuItem({ requiresAuth: true }))).toBe(
        true,
      );
    });

    it('hides quest-only items when authenticated', () => {
      setup(true);
      expect(service.isItemVisible(menuItem({ questOnly: true }))).toBe(false);
    });

    it('shows quest-only items when guest', () => {
      setup(false);
      expect(service.isItemVisible(menuItem({ questOnly: true }))).toBe(true);
    });
  });

  describe('handleBack', () => {
    beforeEach(() => setup(false));

    it('navigates to root from a job detail page', () => {
      router.url = '/jobs/123';

      service.handleBack();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('strips query params before checking the job detail path', () => {
      router.url = '/jobs/123?tab=notes';

      service.handleBack();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('navigates to root when already on the jobs list', () => {
      router.url = '/jobs';

      service.handleBack();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('pops the last segment for nested paths', () => {
      router.url = '/settings/account';

      service.handleBack();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/settings');
    });

    it('ignores query params when popping the last segment', () => {
      router.url = '/settings/account?tab=2';

      service.handleBack();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/settings');
    });

    it('navigates to root for top-level paths', () => {
      router.url = '/profile';

      service.handleBack();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });
  });
});
