const fs = require('fs');
const path = require('path');
// Read the main package.json to get the current version
const packageJson = require('../package.json');

// Path to the angular environment file where the version is defined
const envPath = path.resolve(
  __dirname,
  '../apps/frontend/src/environments/version.ts',
);

try {
  const content = fs.readFileSync(envPath, 'utf8');

  // Replace the 'version: ...' part, regardless of what was there
  const updatedContent = content.replace(
    /version:\s*'.*'/g,
    `version: '${packageJson.version}'`,
  );

  fs.writeFileSync(envPath, updatedContent, 'utf8');
  console.log(`🚀 Version synchronized: ${packageJson.version}`);
} catch (err) {
  console.error('❌ Error synchronizing version:', err.message);
}
