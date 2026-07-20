import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { QueueConfigFactory } from './queue.config.factory';

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
  ],
  exports: [BullModule],
})
export class QueueModule {}
