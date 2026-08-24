/**
 * The fake queue drivers exist so API tests can exercise queued work without
 * Redis, which is only useful if the module that owns the queue still boots
 * under them. Both drivers regressed once: the module re-exported `BullModule`
 * that a fake driver never imported, and the processor's bootstrap hook read
 * `WorkerHost.worker`, a getter that throws when no worker was created.
 *
 * The driver is resolved while the module body is evaluated, so each case has
 * to load the graph fresh. Everything is imported inside the isolated registry
 * - pulling `Test` or `ConfigModule` in from the outer one would mix two
 * copies of Nest and fail on identity rather than on the thing under test.
 */
describe('EmailModule', () => {
  const originalDriver = process.env['QUEUE_DRIVER'];

  afterEach(() => {
    if (originalDriver === undefined) {
      delete process.env['QUEUE_DRIVER'];
    } else {
      process.env['QUEUE_DRIVER'] = originalDriver;
    }
  });

  it.each(['inline', 'memory'])(
    'boots and completes bootstrap under QUEUE_DRIVER=%s',
    async (driver) => {
      process.env['QUEUE_DRIVER'] = driver;

      await jest.isolateModulesAsync(async () => {
        const { Test } = await import('@nestjs/testing');
        const { ConfigModule } = await import('@nestjs/config');
        const { EmailModule } = await import('./email.module');

        const moduleRef = await Test.createTestingModule({
          imports: [ConfigModule.forRoot({ isGlobal: true }), EmailModule],
        }).compile();

        const app = moduleRef.createNestApplication();
        // init() is what runs onApplicationBootstrap - compile() alone would
        // miss the processor's hook entirely.
        await app.init();
        await app.close();
      });
    },
  );
});
