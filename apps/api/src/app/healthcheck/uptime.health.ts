import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class UptimeHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    const uptime = process.uptime();

    const data = {
      uptime: `${Math.floor(uptime)}`,
      timestamp: new Date().toISOString(),
    };

    return indicator.up(data);
  }
}
