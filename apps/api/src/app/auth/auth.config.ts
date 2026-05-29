import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { getLanguageFromResetUrl } from '../email/email.utils';

const DEFAULT_BASE_URL = 'http://localhost:3000/api/auth';
const DEFAULT_TRUSTED_ORIGIN = 'http://localhost:4200';

function getTrustedOrigins(configService: ConfigService): string[] {
  const rawOrigins =
    configService.get<string>('BETTER_AUTH_TRUSTED_ORIGINS') ??
    DEFAULT_TRUSTED_ORIGIN;

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export function createBetterAuth(
  prisma: PrismaService,
  emailService: EmailService,
  configService: ConfigService,
) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    baseURL: configService.get<string>('BETTER_AUTH_URL') ?? DEFAULT_BASE_URL,
    trustedOrigins: getTrustedOrigins(configService),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      sendResetPassword: async ({ user, url }) => {
        const language = getLanguageFromResetUrl(url);
        await emailService.sendResetPasswordEmail(user.email, url, language);
      },
    },
  });
}
