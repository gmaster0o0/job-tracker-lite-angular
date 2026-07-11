export interface MockContextOptions {
  session?: any;
}

export function createMockContext(options?: MockContextOptions): any {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        session: options?.session,
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  };
}
