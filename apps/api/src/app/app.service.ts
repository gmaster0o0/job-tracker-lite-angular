import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from '@job-tracker-lite-angular/api-interfaces';
import { PrismaService } from '@job-tracker-lite-angular/prisma';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async checkHealth(): Promise<HealthResponseDto> {
    const timestamp = new Date().toISOString();
    let databaseStatus: 'UP' | 'DOWN' = 'UP';

    try {
      await this.prisma.testConnection();
    } catch {
      databaseStatus = 'DOWN';
    }

    return {
      status: databaseStatus === 'UP' ? 'UP' : 'DOWN',
      database: databaseStatus,
      timestamp,
    };
  }
}
