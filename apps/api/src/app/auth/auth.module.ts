import { Module } from '@nestjs/common';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { AuthController } from './auth.controller';
import { BETTER_AUTH, createBetterAuth } from './auth.config';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: BETTER_AUTH,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => createBetterAuth(prisma),
    },
  ],
  exports: [BETTER_AUTH],
})
export class AuthModule {}
