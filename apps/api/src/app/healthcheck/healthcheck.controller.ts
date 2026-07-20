import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { HealthService } from './healthcheck.service';

@AllowAnonymous()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  // Used by the orchestrator to decide whether to restart the process.
  @Get('live')
  @HealthCheck()
  live() {
    return this.healthService.checkLiveness();
  }

  // Used by the orchestrator/load balancer to decide whether to route
  // traffic to this instance.
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.healthService.checkReadiness();
  }

  // Not a liveness/readiness probe - for manual/dashboard checks only.
  @Get('detailed')
  @HealthCheck()
  detailed() {
    return this.healthService.checkDetailed();
  }
}
