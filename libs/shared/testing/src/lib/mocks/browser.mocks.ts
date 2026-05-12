/**
 * Mock for localStorage API
 */
export function createLocalStorageMock(): Storage {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value.toString();
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    key: (index: number): string | null => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    length: Object.keys(store).length,
  };
}

/**
 * Mock for MediaQueryList (window.matchMedia)
 */
export function createMediaQueryListMock(matches = false): MediaQueryList {
  const listeners: ((e: MediaQueryListEvent) => void)[] = [];

  return {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (
      type: string,
      listener: (e: MediaQueryListEvent) => void,
    ): void => {
      if (type === 'change') {
        listeners.push(listener);
      }
    },
    removeEventListener: (
      type: string,
      listener: (e: MediaQueryListEvent) => void,
    ): void => {
      if (type === 'change') {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    },
    addListener: (listener: (e: MediaQueryListEvent) => void): void => {
      listeners.push(listener);
    },
    removeListener: (listener: (e: MediaQueryListEvent) => void): void => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    },
    dispatchEvent: (event: Event): boolean => {
      listeners.forEach((listener) => {
        listener(event as MediaQueryListEvent);
      });
      return true;
    },
    onchange: null,
  } as MediaQueryList;
}

/**
 * Mock for Document.documentElement
 */
export function createDocumentElementMock(): HTMLElement {
  const classList: Set<string> = new Set();

  return {
    classList: {
      add: (...classes: string[]): void => {
        classes.forEach((cls) => classList.add(cls));
      },
      remove: (...classes: string[]): void => {
        classes.forEach((cls) => classList.delete(cls));
      },
      toggle: (cls: string, force?: boolean): boolean => {
        if (force === undefined) {
          if (classList.has(cls)) {
            classList.delete(cls);
            return false;
          } else {
            classList.add(cls);
            return true;
          }
        } else if (force) {
          classList.add(cls);
          return true;
        } else {
          classList.delete(cls);
          return false;
        }
      },
      contains: (cls: string): boolean => classList.has(cls),
    },
  } as unknown as HTMLElement;
}
