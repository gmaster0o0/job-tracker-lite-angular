import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Ha nem globális
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaModule } from '@job-tracker-lite-angular/prisma'; // Ha nem globális
import { EmailModule } from '../email/email.module';
import { AuthConfigFactory } from './auth.config.factory';

@Module({
  imports: [
    EmailModule,
    PrismaModule,
    ConfigModule,
    BetterAuthModule.forRootAsync({
      imports: [EmailModule, PrismaModule, ConfigModule],
      inject: [AuthConfigFactory],
      useFactory: (authConfigFactory: AuthConfigFactory) => {
        return {
          auth: authConfigFactory.create(),
          disableBodyParser: true,
          disableGlobalAuthGuard: true,
        };
      },
    }),
  ],
  providers: [AuthConfigFactory],
})
export class AuthModule {}
