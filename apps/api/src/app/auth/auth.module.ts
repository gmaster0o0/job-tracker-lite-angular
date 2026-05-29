import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { createBetterAuth } from './auth.config';

@Module({
  imports: [
    BetterAuthModule.forRootAsync({
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => ({
        auth: createBetterAuth(prisma),
        disableBodyParser: true,
        disableGlobalAuthGuard: true,
      }),
    }),
  ],
})
export class AuthModule {}
