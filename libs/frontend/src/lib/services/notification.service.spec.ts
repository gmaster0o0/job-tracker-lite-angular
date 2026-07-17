import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificationService } from './notification.service';
import { toast } from '@spartan-ng/brain/sonner';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [NotificationService] });
    service = TestBed.inject(NotificationService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
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
});
