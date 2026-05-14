import { Module } from '@nestjs/common';
import { PrismaModule } from '@job-tracker-lite-angular/prisma';
import { JobsModule } from './jobs/jobs.module';
import { HealthModule } from './healthcheck/healthcheck.module';

@Module({
  imports: [PrismaModule, JobsModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
