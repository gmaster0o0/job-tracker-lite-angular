import { Injectable } from '@nestjs/common';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { UptimeHealthIndicator } from './uptime.health';
import { RedisHealthIndicator } from './redis.health';

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: PrismaHealthIndicator,
    private readonly uptime: UptimeHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  // Bound the database ping so a downed/unreachable DB reports "down" quickly
  // instead of stalling the request while the driver waits on a dead socket.
  private readonly dbPingTimeoutMs = 2000;

  /**
   * Check if the service is alive and responding. Only checks the uptime of this instance.
   */
  checkLiveness() {
    return this.health.check([() => this.uptime.isHealthy('server')]);
  }

  /**
   * Only checks dependencies required to handle requests.
   */
  checkReadiness() {
    return this.health.check([
      () =>
        this.db.pingCheck('database', this.prisma, {
          timeout: this.dbPingTimeoutMs,
        }),
    ]);
  }

  /**
   * Detailed health check including database, server uptime, and Redis status.
   * Redis left out of readiness check because the email queue has a fallback
   * mechanism and is not required to serve traffic.
   * @returns The result of the health check.
   */
  checkDetailed() {
    return this.health.check([
      () =>
        this.db.pingCheck('database', this.prisma, {
          timeout: this.dbPingTimeoutMs,
        }),
      () => this.uptime.isHealthy('server'),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
