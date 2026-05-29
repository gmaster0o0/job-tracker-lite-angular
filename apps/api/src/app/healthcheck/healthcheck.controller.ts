import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '@thallesp/nestjs-better-auth';
import { UptimeHealthIndicator } from './uptime.health';
import { PrismaService } from '@job-tracker-lite-angular/prisma';

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
    private uptime: UptimeHealthIndicator,
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
}
