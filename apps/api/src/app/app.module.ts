import { Module } from '@nestjs/common';
import { PrismaModule } from '@job-tracker-lite-angular/prisma';
import { JobsModule } from './jobs/jobs.module';
import { HealthModule } from './healthcheck/healthcheck.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, JobsModule, HealthModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
