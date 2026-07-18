export type NotificationMethod = (...args: unknown[]) => unknown;

export interface NotificationServiceMock {
  success: NotificationMethod;
  error: NotificationMethod;
  info: NotificationMethod;
  warning: NotificationMethod;
  show: NotificationMethod;
}

function createSpy(implementation: NotificationMethod): NotificationMethod {
  const vitestGlobal = (
    globalThis as typeof globalThis & {
      vi?: { fn: (implementation?: NotificationMethod) => NotificationMethod };
    }
  ).vi;

  if (vitestGlobal?.fn) {
    return vitestGlobal.fn(implementation);
  }

  const jestGlobal = (
    globalThis as typeof globalThis & {
      jest?: {
        fn: (implementation?: NotificationMethod) => NotificationMethod;
      };
    }
  ).jest;

  if (jestGlobal?.fn) {
    return jestGlobal.fn(implementation);
  }

  return implementation;
}

export function createNotificationServiceMock(
  mockFactory: NotificationMethod = () => undefined,
  options?: Partial<NotificationServiceMock>,
): NotificationServiceMock {
  return {
    success: options?.success ?? createSpy(mockFactory),
    error: options?.error ?? createSpy(mockFactory),
    info: options?.info ?? createSpy(mockFactory),
    warning: options?.warning ?? createSpy(mockFactory),
    show: options?.show ?? createSpy(mockFactory),
  };
}
