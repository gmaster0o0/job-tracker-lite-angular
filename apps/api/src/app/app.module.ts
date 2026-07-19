import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@job-tracker-lite-angular/prisma';
import { JobsModule } from './jobs/jobs.module';
import { HealthModule } from './healthcheck/healthcheck.module';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { ProfileModule } from './profile/profile.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),

    ScheduleModule.forRoot(),
    PrismaModule,
    JobsModule,
    HealthModule,
    AuthModule,
    AccountModule,
    ProfileModule,
    QueueModule,
  ],
  controllers: [],
})
export class AppModule {}
