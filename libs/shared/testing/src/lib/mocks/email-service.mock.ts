import { SupportLang } from '@job-tracker-lite-angular/schemas';

export type EmailServiceMock = {
  sendEmailChangeConfirmationEmail: (
    email: string,
    url: string,
    locale: SupportLang,
  ) => Promise<void>;
  sendEmailRestoreEmail: (
    email: string,
    url: string,
    locale: SupportLang,
  ) => Promise<void>;
  sendDeleteAccountVerificationEmail: (
    email: string,
    url: string,
    locale: SupportLang,
    graceDays?: number,
  ) => Promise<void>;
  sendDeleteAccountNotificationEmail: (
    email: string,
    locale: SupportLang,
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
    sendDeleteAccountVerificationEmail: createMock(async () => undefined),
    sendDeleteAccountNotificationEmail: createMock(async () => undefined),
  };
}
