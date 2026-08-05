// tools/nx-no-cloud.cjs
// Workaround for MINGW64/Git Bash + Nx Cloud issues in worktree environments

process.env.NX_DAEMON = 'false';
process.env.NX_NO_CLOUD = 'true';

const { execSync } = require('child_process');

const args = process.argv.slice(2).join(' ');

try {
  execSync(`npx nx ${args}`, { stdio: 'inherit' });
} catch (error) {
  process.exit(error.status || 1);
}