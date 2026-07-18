import { Injectable } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  success(message: string, description?: string): void {
    toast.success(message, {
      description,
    });
  }

  error(message: string, description?: string): void {
    toast.error(message, {
      description,
      duration: 6000,
    });
  }

  info(message: string, description?: string): void {
    toast.info(message, {
      description,
    });
  }

  warning(message: string, description?: string): void {
    toast.warning(message, {
      description,
    });
  }

  show(message: string, description?: string): void {
    toast(message, {
      description,
    });
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
  ): Promise<T> {
    toast.promise(promise, messages);
    return promise;
  }
}
