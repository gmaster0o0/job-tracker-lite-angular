import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { UptimeHealthIndicator } from './uptime.health';
import { RedisHealthIndicator } from './redis.health';
import { PrismaService } from '@job-tracker-lite-angular/prisma';

@AllowAnonymous()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
    private uptime: UptimeHealthIndicator,
    private redis: RedisHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', this.prisma),
      () => this.uptime.isHealthy('server'),
    ]);
  }

  // Separate from the main /health check on purpose: a temporary Redis
  // outage shouldn't make Render think the whole service is down and
  // restart it - the email queue already retries on its own once Redis
  // is reachable again. This endpoint is for manual/dashboard checks.
  @Get('detailed')
  @HealthCheck()
  checkDetailed() {
    return this.health.check([
      () => this.db.pingCheck('database', this.prisma),
      () => this.uptime.isHealthy('server'),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
