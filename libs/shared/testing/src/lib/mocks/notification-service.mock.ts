export type NotificationMethod = (...args: unknown[]) => unknown;

export type NotificationPromiseMethod = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((err: unknown) => string);
  },
) => Promise<T>;

export interface NotificationServiceMock {
  success: NotificationMethod;
  error: NotificationMethod;
  info: NotificationMethod;
  warning: NotificationMethod;
  show: NotificationMethod;
  promise: NotificationPromiseMethod;
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

function createPromiseSpy(
  override?: NotificationPromiseMethod,
): NotificationPromiseMethod {
  if (override) {
    return override;
  }

  const defaultImpl = (<T>(promise: Promise<T>) =>
    promise) as NotificationPromiseMethod;

  const vitestGlobal = (
    globalThis as typeof globalThis & {
      vi?: {
        fn: (
          implementation?: NotificationPromiseMethod,
        ) => NotificationPromiseMethod;
      };
    }
  ).vi;

  if (vitestGlobal?.fn) {
    return vitestGlobal.fn(defaultImpl);
  }

  const jestGlobal = (
    globalThis as typeof globalThis & {
      jest?: {
        fn: (
          implementation?: NotificationPromiseMethod,
        ) => NotificationPromiseMethod;
      };
    }
  ).jest;

  if (jestGlobal?.fn) {
    return jestGlobal.fn(defaultImpl);
  }

  return defaultImpl;
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
    promise: createPromiseSpy(options?.promise),
  };
}
