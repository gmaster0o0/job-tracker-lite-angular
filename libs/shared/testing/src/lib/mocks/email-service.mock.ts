export type EmailServiceMock = {
  sendEmailChangeConfirmationEmail: jest.Mock<
    Promise<void>,
    [string, string, 'en' | 'hu']
  >;
  sendEmailRestoreEmail: jest.Mock<
    Promise<void>,
    [string, string, 'en' | 'hu']
  >;
};

export function createEmailServiceMock(): EmailServiceMock {
  return {
    sendEmailChangeConfirmationEmail: jest.fn().mockResolvedValue(undefined),
    sendEmailRestoreEmail: jest.fn().mockResolvedValue(undefined),
  };
}
