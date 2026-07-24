import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { PrismaClientExceptionFilter } from '@job-tracker-lite-angular/prisma';
import { setupSwagger } from './swagger.setup';
import { getEmailConfig } from './app/email/email.config';
import { QueueConfigFactory } from './app/queue/queue.config.factory';

// Mailpit's SMTP port (MAILPIT_PORT, default 1025) is unrelated to its web
// UI port - the web UI is only exposed via the bundled docker-compose
// service, which always maps it to 8025.
const MAILPIT_WEB_UI_PORT = 8025;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const allowedOrigins = (
    configService.get<string>('CORS_ORIGIN') ?? 'http://localhost:4200'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalFilters(new PrismaClientExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const swaggerEnabled = setupSwagger(app, configService, globalPrefix);

  const port = Number(configService.get<string>('PORT') ?? '3000');
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  if (swaggerEnabled) {
    Logger.log(
      `📖 Swagger docs available at: http://localhost:${port}/${globalPrefix}/docs`,
    );
  }

  const emailConfig = getEmailConfig(configService);
  if (emailConfig.provider === 'mailpit') {
    const mailpitHost = emailConfig.mailpit?.host ?? 'localhost';
    Logger.log(
      `📬 Mailpit inbox available at: http://${mailpitHost}:${MAILPIT_WEB_UI_PORT}`,
    );
  }

  const queueConfigFactory = new QueueConfigFactory(configService);
  if (queueConfigFactory.isDashboardEnabled()) {
    Logger.log(
      `📊 Queue dashboard available at: http://localhost:${port}/${globalPrefix}${queueConfigFactory.getDashboardRoute()}`,
    );
  }
}

bootstrap();
