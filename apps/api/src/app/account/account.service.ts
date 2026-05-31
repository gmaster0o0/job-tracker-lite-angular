import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { AccountSettingsDto } from '@job-tracker-lite-angular/schemas';
import { EmailChangeTokenType } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { randomUUID } from 'crypto';

const EMAIL_VERIFICATION_EXPIRES_IN_SECONDS = 60 * 60 * 24;
const EMAIL_RESTORE_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

@Injectable()
export class AccountService {
  private readonly defaultFrontendUrl = 'http://localhost:4200';
  private readonly defaultAuthApiUrl = 'http://localhost:3000/api/auth';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async getAccountSettings(userId: string): Promise<AccountSettingsDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        email: true,
        pendingEmail: true,
        emailVerified: true,
      },
    });

    return {
      email: user.email,
      pendingEmail: user.pendingEmail,
      emailVerified: user.emailVerified,
    };
  }

  async requestEmailChange(userId: string, newEmailRaw: string): Promise<void> {
    const newEmail = newEmailRaw.trim().toLowerCase();
    const currentUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (newEmail === currentUser.email.toLowerCase()) {
      throw new BadRequestException({
        errorCode: 'email_is_same',
        message: 'New email must be different from the current email',
      });
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: newEmail,
        id: {
          not: currentUser.id,
        },
      },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException({
        errorCode: 'user_already_exists',
        message: 'An account with this email already exists',
      });
    }

    const verifyToken = randomUUID();
    const verifyTokenExpiresAt = this.addSeconds(
      EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          pendingEmail: newEmail,
        },
      });

      await tx.emailChangeToken.deleteMany({
        where: {
          userId,
          type: EmailChangeTokenType.VERIFY,
        },
      });

      await tx.emailChangeToken.create({
        data: {
          token: verifyToken,
          userId,
          type: EmailChangeTokenType.VERIFY,
          oldEmail: currentUser.email,
          newEmail,
          expiresAt: verifyTokenExpiresAt,
        },
      });
    });

    const verifyUrl = `${this.getApiBaseUrl()}/account/verify-email-change?token=${encodeURIComponent(
      verifyToken,
    )}`;

    await this.emailService.sendVerificationEmail(newEmail, verifyUrl, 'en');
  }

  async verifyEmailChange(token: string): Promise<string> {
    if (!token || token.trim().length === 0) {
      return this.buildFrontendAccountUrl('missing_token');
    }

    const verifyToken = await this.prisma.emailChangeToken.findUnique({
      where: { token },
    });

    if (!verifyToken || verifyToken.type !== EmailChangeTokenType.VERIFY) {
      return this.buildFrontendAccountUrl('invalid_token');
    }

    if (verifyToken.expiresAt <= new Date()) {
      await this.prisma.emailChangeToken.delete({
        where: { token: verifyToken.token },
      });
      return this.buildFrontendAccountUrl('token_expired');
    }

    const existingOwner = await this.prisma.user.findFirst({
      where: {
        email: verifyToken.newEmail,
        id: { not: verifyToken.userId },
      },
      select: { id: true },
    });

    if (existingOwner) {
      await this.prisma.emailChangeToken.delete({
        where: { token: verifyToken.token },
      });
      return this.buildFrontendAccountUrl('email_taken');
    }

    const restoreToken = randomUUID();
    const restoreTokenExpiresAt = this.addSeconds(
      EMAIL_RESTORE_EXPIRES_IN_SECONDS,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: verifyToken.userId },
        data: {
          email: verifyToken.newEmail,
          pendingEmail: null,
          emailVerified: true,
        },
      });

      await tx.emailChangeToken.deleteMany({
        where: {
          userId: verifyToken.userId,
          type: EmailChangeTokenType.RESTORE,
        },
      });

      await tx.emailChangeToken.delete({
        where: { token: verifyToken.token },
      });

      await tx.emailChangeToken.create({
        data: {
          token: restoreToken,
          userId: verifyToken.userId,
          type: EmailChangeTokenType.RESTORE,
          oldEmail: verifyToken.oldEmail,
          newEmail: verifyToken.newEmail,
          expiresAt: restoreTokenExpiresAt,
        },
      });
    });

    const restoreUrl = `${this.getApiBaseUrl()}/account/restore-email?token=${encodeURIComponent(
      restoreToken,
    )}`;

    await this.emailService.sendEmailRestoreEmail(
      verifyToken.oldEmail,
      restoreUrl,
      'en',
    );

    return this.buildFrontendAccountUrl('verified');
  }

  async restoreEmail(token: string): Promise<string> {
    if (!token || token.trim().length === 0) {
      return this.buildFrontendLoginUrl('missing_token');
    }

    const restoreToken = await this.prisma.emailChangeToken.findUnique({
      where: { token },
    });

    if (!restoreToken || restoreToken.type !== EmailChangeTokenType.RESTORE) {
      return this.buildFrontendLoginUrl('invalid_token');
    }

    if (restoreToken.expiresAt <= new Date()) {
      await this.prisma.emailChangeToken.delete({
        where: { token: restoreToken.token },
      });
      return this.buildFrontendLoginUrl('token_expired');
    }

    const existingOwner = await this.prisma.user.findFirst({
      where: {
        email: restoreToken.oldEmail,
        id: { not: restoreToken.userId },
      },
      select: { id: true },
    });

    if (existingOwner) {
      return this.buildFrontendLoginUrl('email_taken');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: restoreToken.userId },
        data: {
          email: restoreToken.oldEmail,
          pendingEmail: null,
          emailVerified: true,
        },
      });

      await tx.session.deleteMany({
        where: {
          userId: restoreToken.userId,
        },
      });

      await tx.emailChangeToken.delete({
        where: { token: restoreToken.token },
      });
    });

    return this.buildFrontendLoginUrl('restored');
  }

  private getApiBaseUrl(): string {
    const authApiUrl =
      this.configService.get<string>('BETTER_AUTH_URL') ??
      this.defaultAuthApiUrl;

    try {
      const parsed = new URL(authApiUrl);
      parsed.pathname = '/api';
      parsed.search = '';
      parsed.hash = '';
      return parsed.toString().replace(/\/$/, '');
    } catch {
      throw new InternalServerErrorException('Invalid BETTER_AUTH_URL value');
    }
  }

  private getFrontendOrigin(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') ?? this.defaultFrontendUrl
    ).replace(/\/$/, '');
  }

  private buildFrontendAccountUrl(status: string): string {
    return `${this.getFrontendOrigin()}/settings/account?emailChange=${encodeURIComponent(
      status,
    )}`;
  }

  private buildFrontendLoginUrl(status: string): string {
    return `${this.getFrontendOrigin()}/auth/login?emailRestore=${encodeURIComponent(
      status,
    )}`;
  }

  private addSeconds(seconds: number): Date {
    return new Date(Date.now() + seconds * 1000);
  }
}
