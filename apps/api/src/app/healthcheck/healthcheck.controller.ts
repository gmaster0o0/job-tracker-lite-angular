import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { HealthService } from './healthcheck.service';

@ApiTags('health')
@AllowAnonymous()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  // Used by the orchestrator to decide whether to restart the process.
  @Get('live')
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness probe',
    description:
      'Checks whether the process itself is up. Used by the orchestrator to decide whether to restart the process.',
  })
  live() {
    return this.healthService.checkLiveness();
  }

  // Used by the orchestrator/load balancer to decide whether to route
  // traffic to this instance.
  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Checks whether the instance is ready to serve traffic (e.g. its dependencies are reachable). Used by the orchestrator/load balancer to decide whether to route traffic to it.',
  })
  ready() {
    return this.healthService.checkReadiness();
  }

  // Not a liveness/readiness probe - for manual/dashboard checks only.
  @Get('detailed')
  @HealthCheck()
  @ApiOperation({
    summary: 'Detailed health report',
    description:
      'Runs the full set of health indicators. Not used by any probe - intended for manual/dashboard checks only.',
  })
  detailed() {
    return this.healthService.checkDetailed();
  }
}
