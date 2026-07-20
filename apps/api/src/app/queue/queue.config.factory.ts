import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RedisConnectionConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tls?: Record<string, never>;
}

@Injectable()
export class QueueConfigFactory {
  private defaultRedisHost = 'localhost';
  private defaultRedisPort = 6379;
  private defaultDashboardRoute = '/admin/queues';

  constructor(private readonly configService: ConfigService) {}

  public getRedisConnection(): RedisConnectionConfig {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (redisUrl) {
      return this.parseRedisUrl(redisUrl);
    }

    return {
      host: this.getRedisHost(),
      port: this.getRedisPort(),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    };
  }

  public getDashboardRoute(): string {
    return (
      this.configService.get<string>('QUEUE_DASHBOARD_ROUTE') ??
      this.defaultDashboardRoute
    );
  }

  public isDashboardEnabled(): boolean {
    return this.configService.get<string>('ENABLE_QUEUE_DASHBOARD') === 'true';
  }

  public getDashboardCredentials(): { username: string; password: string } {
    const username = this.configService.get<string>('QUEUE_DASHBOARD_USER');
    const password = this.configService.get<string>('QUEUE_DASHBOARD_PASSWORD');

    if (!username || !password) {
      // Fail fast instead of silently exposing the dashboard unprotected.
      throw new Error(
        'QUEUE_DASHBOARD_USER and QUEUE_DASHBOARD_PASSWORD must be set when ENABLE_QUEUE_DASHBOARD=true',
      );
    }

    return { username, password };
  }

  private parseRedisUrl(redisUrl: string): RedisConnectionConfig {
    const parsed = new URL(redisUrl);

    return {
      host: parsed.hostname,
      port: Number(parsed.port) || this.defaultRedisPort,
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      // rediss:// (double s) means TLS is required - this is how Upstash
      // and most managed Redis providers expose their TCP endpoint.
      tls: parsed.protocol === 'rediss:' ? {} : undefined,
    };
  }

  private getRedisHost(): string {
    return (
      this.configService.get<string>('REDIS_HOST') ?? this.defaultRedisHost
    );
  }

  private getRedisPort(): number {
    return (
      this.configService.get<number>('REDIS_PORT') ?? this.defaultRedisPort
    );
  }
}
