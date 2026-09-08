import { execSync } from 'node:child_process';
import { workspaceRoot } from '@nx/devkit';

/**
 * Tears the local test stack down after the run.
 *
 * This lives in globalTeardown rather than as a trailing command on the
 * e2e-local target because nx:run-commands stops at the first failing
 * command - a trailing `down` would be skipped on exactly the runs that
 * leave containers behind. globalTeardown runs whether the suite passed or
 * failed.
 *
 * `down -v` drops the volume, so the next run replays every migration. Set
 * E2E_KEEP_STACK=true to keep it up while iterating.
 */
export default function globalTeardown(): void {
  if (process.env['CI']) {
    // CI runs against service containers it owns; nothing here to stop.
    return;
  }

  if (process.env['E2E_MOCKED'] === 'true') {
    // The mocked lane never starts the stack.
    return;
  }

  if (process.env['E2E_KEEP_STACK'] === 'true') {
    console.log('[e2e] E2E_KEEP_STACK=true - leaving the test stack running.');
    return;
  }

  console.log('[e2e] Stopping the test stack...');
  try {
    execSync('docker compose -f docker-compose.test.yml down -v', {
      cwd: workspaceRoot,
      stdio: 'inherit',
    });
  } catch (error) {
    // Never fail a green run because cleanup could not finish.
    console.warn(
      `[e2e] Could not stop the test stack: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
