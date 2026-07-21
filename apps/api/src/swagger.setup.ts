import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Swagger should only be enabled in non-production environments,
 * so we can avoid exposing our API docs in production.
 */
function isDevEnvironment(configService: ConfigService): boolean {
  return configService.get<string>('NODE_ENV') !== 'production';
}

/**
 * Sets up Swagger UI/JSON at `${globalPrefix}/docs` when running outside of
 * production. Returns whether it was set up, so the caller can log the URL.
 */
export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
  globalPrefix: string,
): boolean {
  if (!isDevEnvironment(configService)) {
    return false;
  }

  const config = new DocumentBuilder()
    .setTitle('Job Tracker Lite API')
    .setDescription('API documentation for the Job Tracker Lite backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  return true;
}
