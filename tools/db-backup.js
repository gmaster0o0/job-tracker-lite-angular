const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Credentials are never passed in: the dump runs inside the container and reads
// POSTGRES_USER / POSTGRES_DB from its own environment.
const CONTAINER = process.env.DB_CONTAINER || 'job-tracker-shared-db';
const BACKUP_DIR = path.resolve(__dirname, '../backups');
const KEEP = Number(process.env.DB_BACKUP_KEEP || 10);

function timestamp() {
  const [date, time] = new Date().toISOString().split('T');
  return `${date.replace(/-/g, '')}-${time.slice(0, 8).replace(/:/g, '')}`;
}

function prune() {
  const dumps = fs
    .readdirSync(BACKUP_DIR)
    .filter((name) => name.endsWith('.dump'))
    .sort()
    .reverse();

  for (const stale of dumps.slice(KEEP)) {
    fs.unlinkSync(path.join(BACKUP_DIR, stale));
    console.log(`Pruned old backup: ${stale}`);
  }
}

fs.mkdirSync(BACKUP_DIR, { recursive: true });

const target = path.join(BACKUP_DIR, `jobtracker-${timestamp()}.dump`);
const output = fs.createWriteStream(target);

// -Fc is the custom format: compressed, and restorable selectively.
const child = spawn(
  'docker',
  [
    'exec',
    CONTAINER,
    'sh',
    '-c',
    'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc',
  ],
  { stdio: ['ignore', 'pipe', 'inherit'] },
);

child.stdout.pipe(output);

child.on('error', (error) => {
  console.error(`Failed to run docker: ${error.message}`);
  process.exitCode = 1;
});

child.on('close', (code) => {
  if (code !== 0) {
    // A partial file is worse than none - it looks like a usable backup.
    output.destroy();
    fs.rmSync(target, { force: true });
    console.error(`pg_dump exited with code ${code}; no backup written.`);
    process.exitCode = 1;
    return;
  }

  output.end(() => {
    const { size } = fs.statSync(target);

    if (size === 0) {
      fs.rmSync(target, { force: true });
      console.error('pg_dump produced an empty file; no backup written.');
      process.exitCode = 1;
      return;
    }

    console.log(`Backup written: ${path.relative(process.cwd(), target)}`);
    console.log(`Size: ${(size / 1024).toFixed(1)} KB`);
    prune();
  });
});
