import { EventEmitter } from 'events';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { QueueConfigFactory } from './queue.config.factory';

const isMemoryQueue =
  process.env.QUEUE_DRIVER === 'memory' ||
  process.env.QUEUE_DRIVER === 'inline';

@Module({
  imports: [ConfigModule],
  providers: [QueueConfigFactory],
  exports: [QueueConfigFactory],
})
export class QueueModule {
  static forRoot() {
    if (isMemoryQueue) {
      return {
        module: QueueModule,
      };
    }

    return {
      module: QueueModule,
      imports: [
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
    };
  }

  static registerQueue(name: string) {
    if (isMemoryQueue) {
      class MemoryQueueFake extends EventEmitter {
        async add() {
          return { id: 'memory-job' };
        }
      }

      const queueToken = getQueueToken(name);
      return {
        module: QueueModule,
        providers: [
          {
            provide: queueToken,
            useValue: new MemoryQueueFake(),
          },
        ],
        exports: [queueToken],
      };
    }

    return BullModule.registerQueue({ name });
  }
}
