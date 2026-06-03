export type EmailServiceMock = {
  sendEmailChangeConfirmationEmail: (
    email: string,
    url: string,
    locale: 'en' | 'hu',
  ) => Promise<void>;
  sendEmailRestoreEmail: (
    email: string,
    url: string,
    locale: 'en' | 'hu',
  ) => Promise<void>;
};

export function createEmailServiceMock(
  createMock: <T extends (...args: any[]) => any>(
    fn: T,
  ) => (...args: Parameters<T>) => ReturnType<T> = (fn) => fn,
): EmailServiceMock {
  return {
    sendEmailChangeConfirmationEmail: createMock(async () => undefined),
    sendEmailRestoreEmail: createMock(async () => undefined),
  };
}
