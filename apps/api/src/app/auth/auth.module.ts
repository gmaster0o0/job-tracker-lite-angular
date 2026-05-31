import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaModule, PrismaService } from '@job-tracker-lite-angular/prisma';
import { EmailModule } from '../email/email.module';
import { AuthConfigFactory } from './auth.config.factory';
import { EmailService } from '../email/email.service';

@Module({
  imports: [
    EmailModule,
    PrismaModule,
    ConfigModule,
    BetterAuthModule.forRootAsync({
      imports: [EmailModule, PrismaModule, ConfigModule],
      inject: [PrismaService, EmailService, ConfigService],
      useFactory: (
        prismaService: PrismaService,
        emailService: EmailService,
        configService: ConfigService,
      ) => {
        const authConfigFactory = new AuthConfigFactory(
          prismaService,
          emailService,
          configService,
        );
        return {
          auth: authConfigFactory.create(),
          disableBodyParser: true,
          disableGlobalAuthGuard: true,
        };
      },
    }),
  ],
  providers: [],
})
export class AuthModule {}
