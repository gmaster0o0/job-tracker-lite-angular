import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { betterAuth } from 'better-auth';
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import {
  getLanguageFromUrl,
  setLanguageOnUrl,
  toUserSlugBase,
} from '@job-tracker-lite-angular/core-utils';
import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AccountStatus, Role } from '@prisma/client';

type EmailAndPasswordConfig = NonNullable<
  BetterAuthOptions['emailAndPassword']
>;
type EmailVerificationConfig = NonNullable<
  BetterAuthOptions['emailVerification']
>;

@Injectable()
export class AuthConfigFactory {
  private defaultBaseUrl = 'http://localhost:3000/api/auth';
  private defaultTrustedOrigin = 'http://localhost:4200';
  private maxSlugAttempts = 5;

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
          role: {
            type: 'string',
            required: false,
            input: false,
            defaultValue: Role.USER,
          },
          slug: {
            type: 'string',
            required: false,
            input: false,
          },
        },
      },
      databaseHooks: {
        user: {
          create: {
            before: async (user) => ({
              data: {
                ...user,
                slug: await this.generateUniqueUserSlug(user.name),
              },
            }),
          },
        },
      },
    });
  }

  /**
   * `User.slug` is required and unique, so every creation path has to supply
   * one. Names are not unique, so a taken base slug gets a random suffix -
   * matching the id-suffix approach the backfill migration used.
   */
  private async generateUniqueUserSlug(name: string | null): Promise<string> {
    const base = toUserSlugBase(name);

    for (let attempt = 0; attempt < this.maxSlugAttempts; attempt++) {
      const candidate =
        attempt === 0 ? base : `${base}-${randomBytes(4).toString('hex')}`;

      const taken = await this.prisma.user.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });

      if (!taken) {
        return candidate;
      }
    }

    // Exhausting the attempts means repeated random collisions, so fall back to
    // a suffix wide enough that a clash is not a practical concern.
    return `${base}-${randomBytes(16).toString('hex')}`;
  }

  private getEmailAndPasswordConfig(): EmailAndPasswordConfig {
    return {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        const language = getLanguageFromUrl(url);
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
        const callbackUrl = new URL(
          verifyUrl.searchParams.get('callbackURL') ?? '/auth/verify-email',
          frontendOrigin,
        );
        const language = getLanguageFromUrl(
          callbackUrl.toString(),
          'language',
          getLanguageFromUrl(url),
        );

        setLanguageOnUrl(callbackUrl, language);
        verifyUrl.searchParams.set('callbackURL', callbackUrl.toString());

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

  private isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
}
