import { EmailService } from './email.service';
import { EmailConfig } from './email.constants';
import * as nodemailer from 'nodemailer';

const createTransportMock = jest.fn();
const sendMailMock = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: createTransportMock,
}));

describe('EmailService', () => {
  let service: EmailService;
  let emailConfig: EmailConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    emailConfig = {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      user: 'user',
      pass: 'pass',
      from: 'no-reply@example.com',
    };
    service = new EmailService(emailConfig);

    createTransportMock.mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send reset password email when SMTP config is present', async () => {
    await service.sendResetPasswordEmail(
      'user@example.com',
      'https://example.com/reset',
    );

    expect(createTransportMock).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'user',
        pass: 'pass',
      },
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'no-reply@example.com',
      to: 'user@example.com',
      subject: 'Reset your password – Job Tracker Lite',
      text: 'You requested to reset your password for your Job Tracker Lite account. Use this link: https://example.com/reset',
      html: expect.stringContaining(
        '<a href="https://example.com/reset">Reset Password</a>',
      ),
    });
  });

  it('should do nothing when SMTP config is missing', async () => {
    service = new EmailService({
      host: '',
      port: 0,
      secure: false,
      from: '',
    });

    await expect(
      service.sendResetPasswordEmail(
        'user@example.com',
        'https://example.com/reset',
      ),
    ).resolves.toBeUndefined();

    expect(createTransportMock).not.toHaveBeenCalled();
    expect(sendMailMock).not.toHaveBeenCalled();
  });
});
