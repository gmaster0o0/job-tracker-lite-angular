import { MockResizeObserver } from '../mocks/browser.mocks';

Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  writable: true,
  value: MockResizeObserver,
});
