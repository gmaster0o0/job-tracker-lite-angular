import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { createBetterAuth } from './auth.config';

@Module({
  imports: [
    EmailModule,
    BetterAuthModule.forRootAsync({
      inject: [PrismaService, EmailService],
      useFactory: (prisma: PrismaService, emailService: EmailService) => ({
        auth: createBetterAuth(prisma, emailService),
        disableBodyParser: true,
        disableGlobalAuthGuard: true,
      }),
    }),
  ],
})
export class AuthModule {}
