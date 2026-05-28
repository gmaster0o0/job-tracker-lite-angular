import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';

const DEFAULT_BASE_URL = 'http://localhost:3000/api/auth';
const DEFAULT_TRUSTED_ORIGIN = 'http://localhost:4200';

function getTrustedOrigins(): string[] {
  const rawOrigins =
    process.env['BETTER_AUTH_TRUSTED_ORIGINS'] ?? DEFAULT_TRUSTED_ORIGIN;

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export function createBetterAuth(prisma: PrismaService) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    baseURL: process.env['BETTER_AUTH_URL'] ?? DEFAULT_BASE_URL,
    trustedOrigins: getTrustedOrigins(),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
  });
}
