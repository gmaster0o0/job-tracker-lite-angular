import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification.service';
import { toast } from '@spartan-ng/brain/sonner';

vi.mock('@spartan-ng/brain/sonner', () => {
  const toastImpl = Object.assign(
    vi.fn(() => undefined),
    {
      success: vi.fn(() => undefined),
      error: vi.fn(() => undefined),
      info: vi.fn(() => undefined),
      warning: vi.fn(() => undefined),
      promise: vi.fn((promise: Promise<unknown>) => promise),
    },
  );

  return {
    toast: toastImpl,
  };
});

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [NotificationService] });
    service = TestBed.inject(NotificationService);
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call toast.success', () => {
    service.success('Success message', 'Success description');
    expect(toast.success).toHaveBeenCalledWith('Success message', {
      description: 'Success description',
    });
  });

  it('should call toast.error', () => {
    service.error('Error message', 'Error description');
    expect(toast.error).toHaveBeenCalledWith('Error message', {
      description: 'Error description',
      duration: 6000,
    });
  });

  it('should call toast.info', () => {
    service.info('Info message', 'Info description');
    expect(toast.info).toHaveBeenCalledWith('Info message', {
      description: 'Info description',
    });
  });

  it('should call toast.warning', () => {
    service.warning('Warning message', 'Warning description');
    expect(toast.warning).toHaveBeenCalledWith('Warning message', {
      description: 'Warning description',
    });
  });

  it('should call toast directly for show', () => {
    service.show('Regular message', 'Regular description');
    expect(toast).toHaveBeenCalledWith('Regular message', {
      description: 'Regular description',
    });
  });

  describe('promise', () => {
    it('should call toast.promise with the given promise and messages', () => {
      const promise = Promise.resolve('data');
      const messages = {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      };

      service.promise(promise, messages);

      expect(toast.promise).toHaveBeenCalledWith(promise, messages);
    });

    it('should return the original promise', async () => {
      const promise = Promise.resolve('data');
      const messages = {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      };

      const result = service.promise(promise, messages);

      expect(result).toBe(promise);
      await expect(result).resolves.toBe('data');
    });

    it('should propagate a rejection', async () => {
      const error = new Error('failed');
      const promise = Promise.reject(error);
      const messages = {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      };

      const result = service.promise(promise, messages);

      await expect(result).rejects.toBe(error);
    });
  });
});
