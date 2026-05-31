export const testResetUrl = 'http://localhost/reset?token=123';
export const testRecipient = 'john@example.com';
export const testVerificationUrl = 'http://localhost/verify-email?token=abc';
export const testVerificationRecipient = 'jane@example.com';
export const testSendOptions = {
  to: testRecipient,
  subject: 'Test subject',
  text: 'Plain text body',
  html: '<p>Plain text body</p>',
};

export const testVerificationSendOptions = {
  to: testVerificationRecipient,
  subject: 'Verify your email - Job Tracker Lite',
  text: 'Verification email body',
  html: '<p>Verification email body</p>',
};

export const validVerificationEmailCredentials = {
  email: testVerificationRecipient,
  language: 'en' as const,
};
