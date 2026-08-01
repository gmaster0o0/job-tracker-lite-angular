import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import basicAuth from 'express-basic-auth';
import { getMailerOptions } from './email.config';
import { emailProviderFactory } from './providers/email-provider.factory';
import { EMAIL_QUEUE } from './email.queue';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { QueueModule } from '../queue/queue.module';
import { isFakeQueueDriver } from '../queue/queue.driver';
import { QueueConfigFactory } from '../queue/queue.config.factory';

// NODE_ENV alone isn't a reliable signal here - the staging server on Render
// also runs with NODE_ENV=production. Use a dedicated flag instead, so the
// dashboard can be deliberately enabled on staging (with auth) while staying
// off in real production.
//
// TODO: this reads process.env at module-body evaluation time, which runs
// BEFORE ConfigModule.forRoot() (in AppModule) has loaded .env into
// process.env - AppModule imports HealthModule/AuthModule/AccountModule,
// which all transitively import EmailModule, ahead of its own
// ConfigModule.forRoot() call. So this flag only works via a real OS/Docker
// env var (fine in production on Render); setting it in a local .env file
// has no effect. See getEmailConfig()'s ConfigService-based pattern in
// email.config.ts for the fix - move this behind an injected ConfigService
// instead of a raw process.env read.
// The dashboard reads job state straight out of Redis.
const isDashboardEnabled =
  process.env.ENABLE_QUEUE_DASHBOARD === 'true' && !isFakeQueueDriver();

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getMailerOptions(configService),
    }),
    // The Redis connection (BullModule.forRootAsync) is configured once in
    // QueueModule; here we only register this module's queue.
    QueueModule.registerQueue(EMAIL_QUEUE, EmailProcessor),
    // Bull Board's forRootAsync (dashboard instance) and forFeature (queue
    // registration) must live in the SAME module - the package can't
    // resolve "bull_board_instance" across module boundaries even with
    // proper exports/imports. Since this is currently the only queue in the
    // app, both live here together. If more queues are added later, they'll
    // need to move here too (or this whole setup gets consolidated into a
    // single dedicated module).
    ...(isDashboardEnabled
      ? [
          BullBoardModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
              const queueConfigFactory = new QueueConfigFactory(configService);
              const credentials = queueConfigFactory.getDashboardCredentials();

              return {
                route: queueConfigFactory.getDashboardRoute(),
                adapter: ExpressAdapter,
                middleware: basicAuth({
                  users: { [credentials.username]: credentials.password },
                  challenge: true,
                }),
              };
            },
          }),
          BullBoardModule.forFeature({
            name: EMAIL_QUEUE,
            adapter: BullMQAdapter,
          }),
        ]
      : []),
  ],
  providers: [EmailService, EmailProcessor, emailProviderFactory],
  exports: [EmailService, BullModule],
})
export class EmailModule {}
