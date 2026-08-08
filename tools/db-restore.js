const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CONTAINER = process.env.DB_CONTAINER || 'job-tracker-shared-db';
const BACKUP_DIR = path.resolve(__dirname, '../backups');

const args = process.argv.slice(2);
const confirmed = args.includes('--yes');
const requested = args.find((arg) => !arg.startsWith('--'));

function newestDump() {
  if (!fs.existsSync(BACKUP_DIR)) {
    return null;
  }

  const [newest] = fs
    .readdirSync(BACKUP_DIR)
    .filter((name) => name.endsWith('.dump'))
    .sort()
    .reverse();

  return newest ? path.join(BACKUP_DIR, newest) : null;
}

const dump = requested ? path.resolve(requested) : newestDump();

if (!dump || !fs.existsSync(dump)) {
  console.error(
    requested
      ? `No such dump: ${requested}`
      : `No backups found in ${BACKUP_DIR}. Run "npm run db:backup" first.`,
  );
  process.exitCode = 1;
  return;
}

// Restoring drops and recreates every object it owns, so it refuses without
// an explicit --yes.
if (!confirmed) {
  console.log(`Would restore ${path.relative(process.cwd(), dump)}`);
  console.log(`into database "$POSTGRES_DB" in container ${CONTAINER}.`);
  console.log('');
  console.log('This DROPS the current contents of that database.');
  console.log('Re-run with --yes to go ahead:');
  console.log(
    `  npm run db:restore -- ${path.relative(process.cwd(), dump)} --yes`,
  );
  process.exitCode = 1;
  return;
}

const child = spawn(
  'docker',
  [
    'exec',
    '-i',
    CONTAINER,
    'sh',
    '-c',
    'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner',
  ],
  { stdio: ['pipe', 'inherit', 'inherit'] },
);

fs.createReadStream(dump).pipe(child.stdin);

child.on('error', (error) => {
  console.error(`Failed to run docker: ${error.message}`);
  process.exitCode = 1;
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`pg_restore exited with code ${code}.`);
    process.exitCode = 1;
    return;
  }

  console.log(`Restored ${path.relative(process.cwd(), dump)}`);
});
