import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { betterAuth } from 'better-auth';
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { getLanguageFromResetUrl } from '../email/email.utils';
import { Injectable } from '@nestjs/common';
import { AccountStatus } from '@prisma/client';

type EmailAndPasswordConfig = NonNullable<
  BetterAuthOptions['emailAndPassword']
>;
type EmailVerificationConfig = NonNullable<
  BetterAuthOptions['emailVerification']
>;

type DeleteUserConfig = NonNullable<BetterAuthOptions['user']>['deleteUser'];

@Injectable()
export class AuthConfigFactory {
  private defaultBaseUrl = 'http://localhost:3000/api/auth';
  private defaultTrustedOrigin = 'http://localhost:4200';

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  public create() {
    const authUrl =
      this.configService.get<string>('BETTER_AUTH_URL') ?? this.defaultBaseUrl;

    if (!authUrl && this.isProduction()) {
      throw new Error('BETTER_AUTH_URL environment variable is required');
    }

    return betterAuth({
      database: prismaAdapter(this.prisma, {
        provider: 'postgresql',
      }),
      baseURL:
        this.configService.get<string>('BETTER_AUTH_URL') ??
        this.defaultBaseUrl,
      trustedOrigins: this.getTrustedOrigins(this.configService),
      emailAndPassword: this.getEmailAndPasswordConfig(),
      emailVerification: this.getEmailVerificationConfig(),
      user: {
        additionalFields: {
          status: {
            type: 'string',
            required: false,
            input: false,
            defaultValue: AccountStatus.ACTIVE,
          },
        },
      },
    });
  }

  private getEmailAndPasswordConfig(): EmailAndPasswordConfig {
    return {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        const language = getLanguageFromResetUrl(url);
        await this.emailService.sendResetPasswordEmail(
          user.email,
          url,
          language,
        );
      },
    };
  }

  private getEmailVerificationConfig(): EmailVerificationConfig {
    return {
      expiresIn: 60 * 60 * 24,
      sendVerificationEmail: async ({ user, url }) => {
        const frontendOrigin =
          this.configService.get<string>('FRONTEND_URL') ??
          'http://localhost:4200';
        const verifyUrl = new URL(url);

        verifyUrl.searchParams.set(
          'callbackURL',
          `${frontendOrigin}/auth/verify-email`,
        );
        const language = getLanguageFromResetUrl(url);
        await this.emailService.sendVerificationEmail(
          user.email,
          verifyUrl.toString(),
          language,
        );
      },
    };
  }

  private getTrustedOrigins(configService: ConfigService): string[] {
    const rawOrigins = configService.get<string>('BETTER_AUTH_TRUSTED_ORIGINS');

    // using default value in development, but require explicit configuration in
    // production to avoid mistakes
    if (!rawOrigins) {
      if (this.isProduction()) {
        throw new Error(
          'BETTER_AUTH_TRUSTED_ORIGINS environment variable is required in production',
        );
      }
      return [this.defaultTrustedOrigin];
    }

    return rawOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
  }
  /**
   *
   * @returns
   */
  private getDeleteUserConfig(): DeleteUserConfig {
    return {
      enabled: true,
      sendDeleteAccountVerification: async (data, request) => {
        const language = getLanguageFromResetUrl(data.url);
        await this.emailService.sendDeleteAccountVerificationEmail(
          data.user.email,
          data.url,
          language,
        );
      },
    };
  }

  private isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
}
