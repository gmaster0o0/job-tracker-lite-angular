import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './healthcheck.controller';
import { UptimeHealthIndicator } from './uptime.health';
import { RedisHealthIndicator } from './redis.health';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TerminusModule, HttpModule, EmailModule],
  controllers: [HealthController],
  providers: [UptimeHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
