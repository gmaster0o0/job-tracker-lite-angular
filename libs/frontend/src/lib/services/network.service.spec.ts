import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NetworkService } from './network.service';

describe('NetworkService', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;

  const createService = (
    platform: 'browser' | 'server' = 'browser',
    onLine = true,
  ) => {
    Object.defineProperty(navigator, 'onLine', {
      value: onLine,
      configurable: true,
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [NetworkService, { provide: PLATFORM_ID, useValue: platform }],
    });
    return TestBed.inject(NetworkService);
  };

  const listenerFor = (event: string) => {
    const call = addEventListenerSpy.mock.calls.find(
      (call: unknown[]) => call[0] === event,
    );
    return call?.[1] as (() => void) | undefined;
  };

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(createService()).toBeTruthy();
  });

  it('should initialize isOnline from navigator.onLine', () => {
    expect(createService('browser', true).isOnline()).toBe(true);
    expect(createService('browser', false).isOnline()).toBe(false);
  });

  it('should default to online on the server (no navigator access)', () => {
    expect(createService('server').isOnline()).toBe(true);
  });

  it('should flip to offline when the offline event fires', () => {
    const service = createService('browser', true);

    listenerFor('offline')?.();

    expect(service.isOnline()).toBe(false);
  });

  it('should flip to online when the online event fires', () => {
    const service = createService('browser', false);

    listenerFor('online')?.();

    expect(service.isOnline()).toBe(true);
  });

  it('should not register browser listeners on the server', () => {
    createService('server');

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });
});
