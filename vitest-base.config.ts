import { defineConfig } from 'vitest/config';

// Picked up by the `@angular/build:unit-test` targets that set
// `"runnerConfig": true`; the builder still owns the build side of the run.

const shuffle = process.env['VITEST_SHUFFLE'] === 'true';

const seed = process.env['VITEST_SEED']
  ? Number(process.env['VITEST_SEED'])
  : Date.now();

if (shuffle) {
  console.log(`[vitest] shuffled run - replay with VITEST_SEED=${seed}`);
}

export default defineConfig({
  test: {
    // CI shares a two-core runner between the unit tests, the builds and the
    // e2e dev servers, so a jsdom worker can lose the CPU for seconds at a
    // time. The specs bound their own waits, so this only buys scheduling
    // headroom on top of Vitest's 5s default.
    testTimeout: 15_000,
    hookTimeout: 15_000,
    sequence: {
      shuffle: shuffle && { files: true, tests: true },
      seed,
    },
  },
});
