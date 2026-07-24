import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { getEmailConfig } from '../email.config';
import {
  type EmailProvider,
  type SendEmailOptions,
} from './email-provider.interface';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  // Built lazily on first send() rather than in the constructor - Nest
  // instantiates every provider listed in EmailModule regardless of which
  // one EMAIL_PROVIDER actually selects, so requiring RESEND_API_KEY here
  // would break bootstrap whenever a different provider is configured.
  private client: Resend | undefined;

  constructor(private readonly configService: ConfigService) {}

  async send(options: SendEmailOptions): Promise<void> {
    const emailConfig = getEmailConfig(this.configService);

    if (!emailConfig.resend) {
      throw new Error('Missing Resend configuration');
    }

    this.client ??= new Resend(emailConfig.resend.apiKey);

    const { error } = await this.client.emails.send({
      from: options.from ?? emailConfig.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments?.map((attachment) => ({
        filename: attachment.filename,
        path: attachment.path,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    if (error) {
      throw new Error(`Resend API error (${error.name}): ${error.message}`);
    }
  }
}
