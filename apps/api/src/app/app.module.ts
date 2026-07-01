import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@job-tracker-lite-angular/prisma';
import { JobsModule } from './jobs/jobs.module';
import { HealthModule } from './healthcheck/healthcheck.module';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    PrismaModule,
    JobsModule,
    HealthModule,
    AuthModule,
    AccountModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
