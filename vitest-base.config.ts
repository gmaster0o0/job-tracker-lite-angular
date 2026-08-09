import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));
const coverageProject = process.env['NX_TASK_TARGET_PROJECT'] ?? 'vitest';
const coverageReportsDirectory = path.join(
  workspaceRoot,
  'coverage',
  'raw',
  coverageProject,
);

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
    coverage: {
      provider: 'v8',
      reportsDirectory: coverageReportsDirectory,
      htmlDir: path.join(coverageReportsDirectory, 'lcov-report'),
      reporter: ['html', 'json', 'json-summary', 'lcov', 'text-summary'],
      // Only ship *.ts logic in the coverage report - templates, static
      // assets and test-support code (harnesses/mocks/fixtures) aren't
      // production logic and just add noise to the unified report.
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/*.html',
        '**/public/**',
        '**/testing/**',
        '**/*.harness.ts',
        '**/*.mock.ts',
        '**/*.mocks.ts',
        '**/*.fixture.ts',
        '**/*.fixtures.ts',
        // Vendored Spartan NG components (copied into the repo by their
        // CLI, not hand-written here) - not ours to hold to a coverage bar.
        '**/shared-ui/**',
      ],
    },
  },
});
