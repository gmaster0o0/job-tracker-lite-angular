import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import basicAuth from 'express-basic-auth';
import { QueueConfigFactory } from './queue.config.factory';

// NODE_ENV alone isn't a reliable signal here - the staging server on Render
// also runs with NODE_ENV=production. Use a dedicated flag instead, so the
// dashboard can be deliberately enabled on staging (with auth) while staying
// off in real production.
const isDashboardEnabled = process.env.ENABLE_QUEUE_DASHBOARD === 'true';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const queueConfigFactory = new QueueConfigFactory(configService);

        return {
          connection: queueConfigFactory.getRedisConnection(),
        };
      },
    }),
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
        ]
      : []),
  ],
  exports: [BullModule],
})
export class QueueModule {}
