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
    addEventListener: mockFactory(),
    removeEventListener: mockFactory(),
    dispatchEvent: mockFactory(),
  } as unknown as MediaQueryList;
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
