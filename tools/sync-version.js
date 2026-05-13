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
  let updatedContent = content;

  // Handle `export const version = 'x'` (common in standalone version files)
  updatedContent = updatedContent.replace(
    /(export\s+const\s+version\s*=\s*)(['"`])[^'"`]*\2(;?)/,
    `$1'${packageJson.version}'$3`,
  );

  // Handle object property `version: 'x'` (common in environment objects)
  updatedContent = updatedContent.replace(
    /(version\s*:\s*)(['"`])[^'"`]*\2(;?)/g,
    `$1'${packageJson.version}'$3`,
  );

  fs.writeFileSync(envPath, updatedContent, 'utf8');
  console.log(`🚀 Version synchronized: ${packageJson.version}`);
} catch (err) {
  console.error('❌ Error synchronizing version:', err.message);
}
