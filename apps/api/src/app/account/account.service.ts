import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import {
  AccountDeletionStatusDto,
  AccountSettingsDto,
  SupportLang,
} from '@job-tracker-lite-angular/schemas';
import { AccountStatus, EmailChangeTokenType } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { randomUUID } from 'crypto';
import { parseEnvValue } from '@job-tracker-lite-angular/core-utils';

@Injectable()
export class AccountService {
  private readonly defaultFrontendUrl = 'http://localhost:4200';
  private readonly defaultAuthApiUrl = 'http://localhost:3000/api/auth';
  private readonly defaultEmailVerificationExpiresIn = 60 * 60 * 24; // 24 hours
  private readonly defaultEmailRestoreExpiresIn = 60 * 60 * 24 * 7; // 7 days
  private readonly defaultDeleteVerificationExpiresIn = 60 * 30; // 30 minutes
  private readonly defaultDeletionGracePeriodDays = 7; // 7 days;

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

  async requestEmailChange(
    userId: string,
    newEmailRaw: string,
    language: SupportLang,
  ): Promise<void> {
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
      this.getEmailVerificationExpiresInSeconds(),
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

    await this.emailService.sendEmailChangeConfirmationEmail(
      newEmail,
      verifyUrl,
      language,
    );
  }

  async verifyEmailChange(
    token: string,
    language: SupportLang,
  ): Promise<string> {
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
      this.getEmailRestoreExpiresInSeconds(),
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

      await tx.session.deleteMany({
        where: {
          userId: verifyToken.userId,
        },
      });
    });

    const restoreUrl = `${this.getApiBaseUrl()}/account/restore-email?token=${encodeURIComponent(
      restoreToken,
    )}`;

    await this.emailService.sendEmailRestoreEmail(
      verifyToken.oldEmail,
      restoreUrl,
      language,
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

  async requestAccountDeletion(
    userId: string,
    language: SupportLang,
  ): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });

    if (this.isPendingDeletionStatus(user.status)) {
      return;
    }

    const token = randomUUID();
    const expiresAt = this.addSeconds(this.getDeleteVerificationExpiresIn());

    await this.prisma.$transaction(async (tx) => {
      await tx.accountDeletionToken.deleteMany({
        where: { userId: user.id },
      });

      await tx.accountDeletionToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });
    });

    const verifyUrl = `${this.getApiBaseUrl()}/account/confirm-delete?token=${encodeURIComponent(
      token,
    )}`;

    await this.emailService.sendDeleteAccountVerificationEmail(
      user.email,
      verifyUrl,
      language,
      this.getDeletionGracePeriodDays(),
    );
  }

  async confirmAccountDeletion(
    token: string,
    language: SupportLang,
  ): Promise<string> {
    if (!token || token.trim().length === 0) {
      return this.buildFrontendLoginDeletionUrl('missing_token');
    }

    const deletionToken = await this.prisma.accountDeletionToken.findUnique({
      where: { token },
    });

    if (!deletionToken) {
      return this.buildFrontendLoginDeletionUrl('invalid_token');
    }

    if (deletionToken.expiresAt <= new Date()) {
      return this.buildFrontendLoginDeletionUrl('token_expired');
    }

    const gracePeriodRequestedAt = new Date();
    const gracePeriodDays = this.getDeletionGracePeriodDays();
    const scheduledDeletionAt = this.calculateScheduledDeletionAt(
      gracePeriodRequestedAt,
      gracePeriodDays,
    );

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: deletionToken.userId },
      select: { email: true },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: deletionToken.userId },
        data: {
          status: AccountStatus.PENDING_DELETION,
          gracePeriodRequestedAt,
          scheduledDeletionAt,
          gracePeriodDays,
        },
      });

      await tx.accountDeletionToken.delete({
        where: { token: deletionToken.token },
      });

      await tx.session.deleteMany({
        where: {
          userId: deletionToken.userId,
        },
      });
    });

    const recoverUrl = this.buildFrontendRecoverUrl();
    await this.emailService.sendDeleteAccountNotificationEmail(
      user.email,
      scheduledDeletionAt,
      recoverUrl,
      language,
    );

    return this.buildFrontendLoginDeletionUrl('confirmed');
  }

  async getAccountDeletionStatus(
    userId: string,
  ): Promise<AccountDeletionStatusDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        status: true,
        gracePeriodRequestedAt: true,
        scheduledDeletionAt: true,
        gracePeriodDays: true,
      },
    });

    return {
      status: this.mapAccountStatus(user.status),
      gracePeriodRequestedAt: user.gracePeriodRequestedAt,
      scheduledDeletionAt: user.scheduledDeletionAt,
      gracePeriodDays: user.gracePeriodDays,
    };
  }

  async recoverAccountDeletion(userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          status: AccountStatus.ACTIVE,
          gracePeriodRequestedAt: null,
          scheduledDeletionAt: null,
        },
      });

      await tx.accountDeletionToken.deleteMany({
        where: { userId },
      });
    });
  }

  async executeScheduledDeletion(): Promise<number> {
    const result = await this.prisma.user.deleteMany({
      where: {
        status: AccountStatus.PENDING_DELETION,
        scheduledDeletionAt: {
          lte: new Date(),
        },
      },
    });

    return result.count;
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

  private buildFrontendLoginDeletionUrl(status: string): string {
    return `${this.getFrontendOrigin()}/auth/login?accountDeletion=${encodeURIComponent(
      status,
    )}`;
  }

  private buildFrontendRecoverUrl(): string {
    return `${this.getFrontendOrigin()}/settings/account/recover`;
  }

  private getEmailVerificationExpiresInSeconds(): number {
    return parseEnvValue(
      this.configService.get('EMAIL_VERIFICATION_EXPIRES_IN_SECONDS'),
      this.defaultEmailVerificationExpiresIn,
    );
  }

  private getEmailRestoreExpiresInSeconds(): number {
    return parseEnvValue(
      this.configService.get('EMAIL_RESTORE_EXPIRES_IN_SECONDS'),
      this.defaultEmailRestoreExpiresIn,
    );
  }

  private getDeleteVerificationExpiresIn(): number {
    return parseEnvValue(
      this.configService.get('ACCOUNT_DELETION_CONFIRM_EXPIRES_IN_SECONDS'),
      this.defaultDeleteVerificationExpiresIn,
    );
  }

  private getDeletionGracePeriodDays(): number {
    return parseEnvValue(
      this.configService.get('ACCOUNT_DELETION_GRACE_PERIOD_DAYS'),
      this.defaultDeletionGracePeriodDays,
    );
  }

  private mapAccountStatus(
    status: AccountStatus,
  ): 'active' | 'pending_deletion' {
    return this.isPendingDeletionStatus(status) ? 'pending_deletion' : 'active';
  }

  private isPendingDeletionStatus(status: AccountStatus): boolean {
    return status === AccountStatus.PENDING_DELETION;
  }

  private addSeconds(seconds: number): Date {
    return new Date(Date.now() + seconds * 1000);
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  private calculateScheduledDeletionAt(
    requestedAt: Date,
    gracePeriodDays: number,
  ): Date {
    const graceThreshold = this.addDays(requestedAt, gracePeriodDays);

    // Deletion jobs run at midnight, so align to the first midnight after threshold.
    const scheduled = new Date(graceThreshold);
    scheduled.setHours(0, 0, 0, 0);
    scheduled.setDate(scheduled.getDate() + 1);

    return scheduled;
  }
}
