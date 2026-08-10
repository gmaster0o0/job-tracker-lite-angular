import { Module, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { QueueConfigFactory } from './queue.config.factory';
import { getQueueDriver, isFakeQueueDriver } from './queue.driver';
import { MemoryQueue, ProcessorLike } from './memory.queue';

@Module({
  imports: [ConfigModule],
  providers: [QueueConfigFactory],
  exports: [QueueConfigFactory],
})
export class QueueModule {
  static forRoot() {
    if (isFakeQueueDriver()) {
      return { module: QueueModule };
    }

    return {
      module: QueueModule,
      imports: [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            connection: new QueueConfigFactory(
              configService,
            ).getRedisConnection(),
          }),
        }),
      ],
      exports: [BullModule],
    };
  }

  /**
   * @param processor the `WorkerHost` handling this queue. Only needed for
   * `QUEUE_DRIVER=inline`, which calls it directly; resolved lazily so the
   * processor's own dependencies are constructed normally.
   */
  static registerQueue(name: string, processor?: Type<unknown>) {
    const driver = getQueueDriver();

    if (driver === 'redis') {
      return BullModule.registerQueue({ name });
    }

    const queueToken = getQueueToken(name);

    return {
      module: QueueModule,
      providers: [
        {
          provide: queueToken,
          inject: [ModuleRef],
          useFactory: (moduleRef: ModuleRef) =>
            new MemoryQueue(
              driver,
              () =>
                processor
                  ? (moduleRef.get(processor, {
                      strict: false,
                    }) as ProcessorLike<unknown>)
                  : undefined,
              name,
            ),
        },
      ],
      exports: [queueToken],
    };
  }
}
