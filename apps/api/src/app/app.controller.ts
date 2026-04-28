import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthResponseDto } from '@job-tracker-lite-angular/api-interfaces';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async checkHealth(): Promise<HealthResponseDto> {
    return this.appService.checkHealth();
  }
}
