import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { createBetterAuth } from './auth.config';

@Module({
  imports: [
    EmailModule,
    BetterAuthModule.forRootAsync({
      imports: [EmailModule],
      inject: [PrismaService, EmailService, ConfigService],
      useFactory: (
        prisma: PrismaService,
        emailService: EmailService,
        configService: ConfigService,
      ) => ({
        auth: createBetterAuth(prisma, emailService, configService),
        disableBodyParser: true,
        disableGlobalAuthGuard: true,
      }),
    }),
  ],
})
export class AuthModule {}
