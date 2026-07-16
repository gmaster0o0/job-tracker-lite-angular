const defaultMockFactory: () => any = () => () => {
  // empty
};

export const createLocalStorageMock = (
  mockFactory: () => any = defaultMockFactory,
) => {
  return {
    getItem: mockFactory(),
    setItem: mockFactory(),
    removeItem: mockFactory(),
    clear: mockFactory(),
    key: mockFactory(),
    length: 0,
  } as Storage;
};

export function createMediaQueryListMock(
  matches = false,
  mockFactory: () => any = defaultMockFactory,
): MediaQueryList {
  return {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: mockFactory(),
    removeEventListener: mockFactory(),
    addListener: mockFactory(),
    removeListener: mockFactory(),
    dispatchEvent: mockFactory(),
  } as unknown as MediaQueryList;
}

export class MockResizeObserver implements ResizeObserver {
  private readonly observedElements = new Set<Element>();

  constructor(private readonly callback: ResizeObserverCallback) {
    this.callback([], this);
  }

  disconnect(): void {
    this.observedElements.clear();
  }

  observe(target: Element, _options?: ResizeObserverOptions): void {
    this.observedElements.add(target);
  }

  unobserve(target: Element): void {
    this.observedElements.delete(target);
  }
}

export function createDocumentElementMock(
  mockFactory: () => any = defaultMockFactory,
): HTMLElement {
  return {
    classList: {
      toggle: mockFactory(),
      contains: mockFactory(),
    },
  } as unknown as HTMLElement;
}

export function createURLMocks() {
  function createObjectURL(_blob?: Blob | null) {
    // return a deterministic string for tests
    return 'blob:mock-url';
  }

  function revokeObjectURL(_url?: string) {
    // noop for tests
    return undefined;
  }

  return { createObjectURL, revokeObjectURL };
}
